Rails.application.routes.draw do
  # E-commerce API endpoints
  namespace :api do
    # Public routes
    resources :products, only: [:index, :show]
    resources :orders, only: [:index, :create]

    # Authentication routes
    post 'register', to: 'authentication#register'
    post 'login', to: 'authentication#login'
    get 'me', to: 'authentication#me'

    # Admin routes
    namespace :admin do
      # Product management
      resources :products, only: [:create, :update, :destroy] do
        member do
          patch :adjust_quantity
        end
      end

      # Order management and dashboard
      resources :orders, only: [:index, :show]
      get 'stats', to: 'orders#stats'
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
