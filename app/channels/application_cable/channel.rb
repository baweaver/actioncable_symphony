module ApplicationCable
  class Channel < ActionCable::Channel::Base
    def prefix
      self.class.name.underscore
    end

    def self.prefix
      name.underscore
    end

    private def current_timestamp
      DateTime.now.strftime('%Q').to_i
    end

    private def time_since(origin)
      current_timestamp - origin
    end

    private def broadcast(channel: channel_name, type:, value: {})
      ActionCable.server.broadcast channel, type: type, message: value
    end

    private def self.broadcast(channel: channel_name, type:, value: {})
      ActionCable.server.broadcast channel, type: type, message: value
    end

    private def channel_name(key: params[:uuid])
      "#{prefix}::#{key}"
    end

    private def self.channel_name(key: params[:uuid])
      "#{prefix}::#{key}"
    end
  end
end
