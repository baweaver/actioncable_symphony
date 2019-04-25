class PlayerChannel < ApplicationCable::Channel
  PREFIX = 'player_channel'

  VALID_META_KEYS = %w(
    instrument
    ready
    latency
    opt_out
    os
    os_version
    browser
    browser_version
    is_mobile
  )

  def subscribed
    ConnectedList.add(params[:uuid])
    stream_from channel_name
  end

  def unsubscribed
    ConnectedList.remove(params[:uuid])
    ClientMeta.remove(params[:uuid])
  end

  def update_meta(message)
    new_keys = VALID_META_KEYS.to_h { |k| [k.to_sym, message[k.to_s]] }

    ClientMeta.set(params[:uuid], **new_keys)
  end

  def receive(message)
    return # nothing for now
  end

  def self.play(uuid:, time:)
    ClientMeta.set(uuid, playing: true)

    broadcast(
      channel: channel_name(uuid: uuid),
      type:    'play',
      value:   time
    )
  end

  def self.stop(uuid:)
    ClientMeta.set(uuid, playing: false)

    broadcast(
      channel: channel_name(uuid: uuid),
      type:    'stop'
    )
  end

  def self.instrument_assignment(uuid:, instrument:)
    broadcast(
      channel: channel_name(uuid: uuid),
      type:    'instrumentAssignment',
      value:   instrument
    )
  end

  private def broadcast(channel: channel_name, type:, value: {})
    ActionCable.server.broadcast channel, type: type, message: value
  end

  private def self.broadcast(channel: channel_name, type:, value: {})
    ActionCable.server.broadcast channel, type: type, message: value
  end

  private def channel_name(uuid: params[:uuid])
    "#{PREFIX}::#{uuid}"
  end

  private def self.channel_name(uuid: params[:uuid])
    "#{PREFIX}::#{uuid}"
  end
end
