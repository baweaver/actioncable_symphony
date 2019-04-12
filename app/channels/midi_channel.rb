class MidiChannel < ApplicationCable::Channel
  def subscribed
    stream_from channel_name
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(message)
    case message[:type]
    when 'instrument' then broadcast_song(message)
    else
      # ...
    end
  end

  def attach(message)
    p message
    broadcast_song(message.symbolize_keys)
  end

  private def broadcast_song(
    song: nil, # Will fix later
    # type:,
    limit: nil,
    seek: nil,
    upTo: nil,
    **misc
  )
    p params

    track = midi['tracks'].find { |track| track['name'] == params[:type] }

    p track['name']

    return false unless track

    track['notes']
      .then(&intercept_if(seek)  { |notes| notes.drop_while { |n| n['time'] <= seek } })
      .then(&intercept_if(upTo)  { |notes| notes.take_while { |n| n['time'] <= upTo } })
      .then(&intercept_if(limit) { |notes| notes.first(limit) })
      .each { |note| broadcast(type: 'note', value: note) }
      .tap { |notes| p notes.first }
  end

  private def intercept_if(cond, &fn)
    -> input { cond ? fn[input] : input }
  end

  private def broadcast(type:, value:)
    ActionCable.server.broadcast channel_name, type: type, message: value
  end

  private def midi
    # Temporary midi player
    raw_json = Rails.root.join("public/beethoven_6th_midi.json")
      .then(&File.method(:read))
      .then(&JSON.method(:parse))

    raw_json
  end

  private def channel_name
    "midi_channel::#{params[:type]}"
  end
end
