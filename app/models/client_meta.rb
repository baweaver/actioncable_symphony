class ClientMeta
  REDIS_KEY = 'client_meta'

  # That there's a blasted race condition here is highly annoying. For
  # whatever reason initializers like to lag on creation and if a websocket
  # gets in _before_ that happens to be, well, initialized things go boom.
  sleep 1 until ActionCableConfig[:url]

  REDIS = ::Redis.new(url: ActionCableConfig[:url])

  def self.all
    REDIS.scan(0, match: all_key)
      .last
      .map { |k| get(k).merge!('uuid' => strip_key(k)) }
  end

  def self.clear_all
    REDIS.scan(0, match: all_key)
      .last
      .each { |k| remove(k) }
  end

  def self.add(uid, **attrs)
    REDIS.mapped_hmset(key(uid), attrs)
  end

  def self.set(uid, **attrs)
    REDIS.mapped_hmset(key(uid), attrs)
  end

  def self.get(uid)
    REDIS.hgetall(key(uid))
  end

  def self.include?(uid)
    !REDIS.hlen(key(uid)).zero?
  end

  def self.remove(uid)
    REDIS.del(key(uid))
  end

  def self.strip_key(uid)
    uid.split(':').last
  end

  def self.key(uid)
    return uid if uid.start_with?(REDIS_KEY)

    "#{REDIS_KEY}:#{uid}"
  end

  def self.all_key
    "#{REDIS_KEY}:*"
  end
end
