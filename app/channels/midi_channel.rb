class MidiChannel < ApplicationCable::Channel
  def subscribed
    stream_from channel_name(key: params[:instrument])
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(message)
    return # nothing for now
  end

  def self.start_broadcast
    broadcast(channel: 'midi_channel::all', type: 'startSongBroadcast')
  end

  def self.stop_broadcast
    broadcast(channel: 'midi_channel::all', type: 'stopSongBroadcast')
  end

  def self.broadcast_track(track:, limit: nil, seek: nil, up_to: nil)
    track_name = track.name
    channel    = channel_name(key: track.name)

    broadcast(channel: channel, type: 'startSongBroadcast')

    track
      .notes(limit: limit, seek: seek, up_to: up_to)
      .each { |note|
        broadcast(channel: channel, type: 'note', value: note)
        broadcast(channel: 'midi_channel::all', type: 'note', value: note)
      }

    broadcast(channel: channel, type: 'stopSongBroadcast')
  end
end
