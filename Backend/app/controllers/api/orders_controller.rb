module Api
  class OrdersController < ApplicationController
  # GET /api/orders
  def index
    authenticate_request

    # Se l'utente è admin, mostra tutti gli ordini
    # Altrimenti mostra solo gli ordini dell'utente loggato
    if current_user&.admin?
      @orders = Order.all.order(created_at: :desc)
    elsif current_user
      @orders = Order.where(user_id: current_user.id).order(created_at: :desc)
    else
      # Utenti non autenticati non possono vedere ordini
      render json: { error: 'Not authenticated' }, status: :unauthorized
      return
    end

    render json: @orders, include: :order_items
  end

  # POST /api/orders
  def create
    authenticate_request

    # Il frontend invia un oggetto con customer, address, items (array di prodotti), total
    @order = Order.new(
      customer: order_params[:customer],
      address: order_params[:address],
      total: order_params[:total]
    )

    # Collega l'ordine all'utente se autenticato
    @order.user = current_user if current_user

    # Creare order items dall'array di prodotti
    if order_params[:items].present?
      order_params[:items].each do |item|
        product_id = item[:id]
        # Verifica che il prodotto esista
        product = Product.find_by(id: product_id)
        unless product
          render json: { error: "Product #{product_id} not found" }, status: :unprocessable_entity
          return
        end

        # Verifica disponibilità in magazzino
        unless product.in_stock?
          render json: { error: "Product #{product.title} is out of stock" }, status: :unprocessable_entity
          return
        end

        @order.order_items.build(
          product_id: product_id,
          quantity: 1, # Il frontend invia prodotti separati per ogni quantità
          unit_price: item[:price]
        )
      end
    end

    if @order.save
      # Riduci la quantità dei prodotti in magazzino
      @order.order_items.each do |order_item|
        product = order_item.product
        product.decrement!(:quantity, order_item.quantity)
      end

      render json: @order, status: :created, include: :order_items
    else
      render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def order_params
    params.require(:order).permit(
      :total,
      customer: [:firstName, :lastName, :email],
      address: [:street, :city, :zip],
      items: [:id, :title, :price, :originalPrice, :sale, :thumbnail, :createdAt, :description, tags: []]
    )
  end
  end
end
