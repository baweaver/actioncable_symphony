Rails.application.routes.draw do
  # devise_for(:users,
  #   path: '/users',
  #   path_names: {
  #    sign_in: 'login',
  #    sign_out: 'logout',
  #    registration: 'signup'
  #   },
  #   controllers: {
  #    sessions: 'users/sessions',
  #    registrations: 'users/registrations'
  # })

  # devise_scope :user do
  #   get 'users/current', to: 'users/sessions#show'
  # end

  root 'application#client'

  get '/admin', to: 'application#admin'
  get '/dashboard', to: 'application#dashboard'

  get '/ze_song', to: 'application#ze_song'
  get '/timesync', to: 'application#timesync'
  post '/timesync', to: 'application#timesync'
  get '/time_page', to: 'application#time_page'
end
