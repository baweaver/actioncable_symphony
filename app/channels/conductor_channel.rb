class ConductorChannel < ApplicationCable::Channel
  OFFSET   = 5_000
  BAD_PING = 5.00

  SONG = 'beethoven_6th_midi'
  # SONG = 'beethoven_9th_midi'

  def subscribed
    stream_from channel_name
    ConductorChannel.update_client_counts
  end

  def unsubscribed
  end

  def receive(message)
    case message['type']
    when 'start_buffer' then broadcast_song(message.symbolize_keys)
    else
      # ...
    end
  end

  def track_names
    broadcast(
      channel: 'conductor_channel::', # Hacks! Hacks!
      type:    'trackNames',
      value:   Midi.available
    )
  end

  def assign_instruments(message)
    song_name = message.fetch('song', SONG)

    client_meta = ClientMeta.all.index_by { |m| m['uuid'] }
    clients     = ConnectedList.all

    latency = -> uuid { client_meta.dig(uuid, 'latency').to_f.abs }

    good_clients = clients.select { |uuid| latency[uuid] < BAD_PING }

    assignments = Midi
      .get(song_name)
      .track_assignments(good_clients)

    # Seperation of concern issue
    assignments.each { |uuid, instrument|
      PlayerChannel.instrument_assignment(uuid: uuid, instrument: instrument)
    }

    broadcast(
      channel: 'conductor_channel::', # Hacks! Hacks!
      type:    'allAssignments',
      value:   assignments
    )
  end

  def buffer_music(message)
    MidiChannel.start_broadcast(message)

    song_name = message.fetch('song', SONG)

    Midi.get(song_name).tracks.each { |track|
      MidiChannel.broadcast_track(
        track: track,
        limit: message.dig('options', 'limit'),
        seek:  message.dig('options', 'seek'),
        up_to: message.dig('options', 'upTo')
      )
    }

    MidiChannel.stop_broadcast(message)
  end

  def play
    current_time = current_timestamp

    ConnectedList.all.each { |uuid|
      current_offset_time = current_time + (OFFSET - time_since(current_time))
      PlayerChannel.play(uuid: uuid, time: current_offset_time)
    }
  end

  def stop
    ConnectedList.all.each { |uuid| PlayerChannel.stop(uuid: uuid) }
  end

  def self.update_meta(uuid, info)
    broadcast(
      channel: 'conductor_channel::',
      type:    'clientMeta',
      value:   info.merge(uuid: uuid)
    )
  end

  def self.update_client_counts
    broadcast(
      channel: 'conductor_channel::',
      type:    'clientCounts',
      value:   ConnectedList.all.size
    )
  end
end
