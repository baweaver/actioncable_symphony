class ConnectedList
  REDIS_KEY = 'connected_nodes'

  # That there's a blasted race condition here is highly annoying. For
  # whatever reason initializers like to lag on creation and if a websocket
  # gets in _before_ that happens to be, well, initialized things go boom.
  sleep 1 until ActionCableConfig[:url]

  REDIS = ::Redis.new(url: ActionCableConfig[:url])

  def self.all
    REDIS.smembers(REDIS_KEY)
  end

  def self.clear_all
    REDIS.del(REDIS_KEY)
  end

  def self.add(uid)
    REDIS.sadd(REDIS_KEY, uid)
  end

  def self.include?(uid)
    REDIS.sismember(REDIS_KEY, uid)
  end

  def self.remove(uid)
    REDIS.srem(REDIS_KEY, uid)
  end
end
