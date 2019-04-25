module Midi
  module Fn
    def self.intercept_if(condition, &fn)
      -> input { condition ? fn[input] : input }
    end
  end

  class Instance
    attr_reader :contents

    include Enumerable

    def initialize(contents)
      @contents = contents
    end

    def track_assignments(ids)
      ids.zip(track_names.cycle).to_h
    end

    def track_names
      tracks.map(&:name)
    end

    def tracks
      @tracks ||= @contents['tracks'].map(&Track.method(:new))
    end

    def get_track(track_name)
      tracks.find { |track| track.name == track_name }
    end

    def each
      tracks.each { |n| yield n }
    end
  end

  class Track
    attr_reader :contents, :name

    include Enumerable

    def initialize(contents)
      @contents = contents
      @name     = contents['name']
    end

    def notes(limit: nil, seek: nil, up_to: nil)
      @contents['notes']
        .then(&Fn.intercept_if(seek)  { |ns| ns.drop_while { |n| n['time'] <= seek  } })
        .then(&Fn.intercept_if(up_to) { |ns| ns.take_while { |n| n['time'] <= up_to } })
        .then(&Fn.intercept_if(limit) { |ns| ns.first(limit) })
    end

    def each
      notes.each { |n| yield n }
    end
  end

  def self.get(name)
    file_name = Rails.root.join("public/#{name}.json")

    return false unless File.exist?(file_name)

    @midi_cache ||= {}
    @midi_cache[name] ||= file_name
      .then(&File.method(:read))
      .then(&JSON.method(:parse))
      .then(&Instance.method(:new))
  end
end
