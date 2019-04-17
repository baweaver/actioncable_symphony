class ConductorChannel < ApplicationCable::Channel
  INSTRUMENTS = [
    "Violino I",
    "Violino II",
    "Viola" ,
    "Violoncello",
    "Contrabasso",
    "Flauti I II",
    "Oboi I II",
    "Clarinetti in B I II",
    "Fagotti I II",
    "Corno I in F",
    "Corno II in F",
  ]

  def subscribed
    stream_from channel_name

    ConnectedList.add(params[:uuid]) unless params[:universal]
  end

  def unsubscribed
    ConnectedList.remove(params[:uuid])
  end

  def receive(message)
    # case message[:type]
    # when 'instrument' then broadcast_song(message)
    # else
    #   # ...
    # end
  end

  def universal_assignments
    # Naive distribution
    all_channels_with_assignments = ConnectedList.all.zip(INSTRUMENTS.cycle).to_h

    all_channels_with_assignments.each { |uuid, instrument|
      broadcast(
        channel_name: channel_name_for(uuid),
        type: 'assignment',
        value: instrument
      )
    }

    broadcast(
      channel_name: 'conductor_channel::universal',
      type: 'all_assignments',
      value: all_channels_with_assignments
    )
  end

  def universal_play
    ConnectedList.all.each { |uuid|
      broadcast(
        channel_name: channel_name_for(uuid),
        type: 'play',
        value: DateTime.now.strftime('%Q').to_i + 3_000
      )
    }
  end

  def universal_stop
    ConnectedList.all.each { |uuid|
      broadcast(channel_name: channel_name_for(uuid), type: 'stop')
    }
  end

  def attach(message)
    broadcast(type: 'assignment', value: INSTRUMENTS.sample)
  end

  private def broadcast(channel_name: channel_name, type:, value: nil)
    ActionCable.server.broadcast channel_name, type: type, message: value
  end

  private def channel_name
    return 'conductor_channel::universal' if params[:universal]

    "conductor_channel::#{params[:uuid]}"
  end

  private def channel_name_for(uuid)
    "conductor_channel::#{uuid}"
  end
end
