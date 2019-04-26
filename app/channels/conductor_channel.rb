class ConductorChannel < ApplicationCable::Channel
  OFFSET = 3_000

  SONG = 'beethoven_6th_midi'
  # SONG = 'beethoven_9th_midi'

  def subscribed
    stream_from channel_name
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
      channel: 'conductor_channel::',
      type:    'trackNames',
      value:   Midi.available
    )
  end

  def assign_instruments(data)
    assignments = Midi
      .get(SONG)
      .track_assignments(ConnectedList.all)

    # Seperation of concern issue
    assignments.each { |uuid, instrument|
      PlayerChannel.instrument_assignment(uuid: uuid, instrument: instrument)
    }

    broadcast(
      channel: 'conductor_channel::',
      type:    'allAssignments',
      value:   assignments
    )
  end

  def buffer_music(message)
    MidiChannel.start_broadcast

    Midi.get(SONG).tracks.each { |track|
      MidiChannel.broadcast_track(
        track: track,
        limit: message['limit'],
        seek:  message['seek'],
        up_to: message['upTo']
      )
    }

    MidiChannel.stop_broadcast
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
end
