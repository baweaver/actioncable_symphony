class ApplicationController < ActionController::Base
  # skip_before_action :authenticate_user!

  skip_before_action :verify_authenticity_token

  def index; end

  def client; end

  def admin; end

  def dashboard; end

  def timesync
    render json: {
      id:     params[:id],
      result: DateTime.now.strftime('%Q').to_i
    }
  end

  def time_page
    render 'time_page'
  end

  AVAILABLE_SONGS = %w(
    first_30s_pastoral
    beethoven_6th_midi
    tico_tico
  )

  # Really quick AJAX version. Only really meant for mocking things out for now.
  def ze_song
    clean_song = params.fetch(:song, 'beethoven_6th_midi')

    raise 'hell' unless clean_song.in?(AVAILABLE_SONGS)

    raw_json = Rails.root.join("public/#{clean_song}.json")
      .then(&File.method(:read))
      .then(&JSON.method(:parse))

    # Yeah yeah, pretty later

    raw_json['header'] = {}

    # Get only a specific track
    raw_json['tracks'].select! { |track|
      track.dig('instrument', 'name') == params[:track]
    } if params[:track]

    # Until a specific time mark
    raw_json['tracks'].each { |track|
      track['notes'].select! { |note|
        note['time'] <= params[:until].to_f
      }
    } if params[:until]

    render json: raw_json
  end
end
