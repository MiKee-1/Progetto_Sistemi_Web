module Api
  class WishlistsController < ApplicationController
    before_action :require_authentication!
    before_action :ensure_wishlist, only: [ :show, :clear ]

    def show
      render json: @wishlist
    end

    def add_item
      product = Product.find(params[:product_id])
      @wishlist = current_user.wishlist || current_user.create_wishlist

      if @wishlist.wishlist_items.exists?(product_id: product.id)
        render json: { error: "Product already in wishlist" }, status: :unprocessable_entity
        return
      end

      wishlist_item = @wishlist.wishlist_items.create!(product_id: product.id)

      render json: {
        message: "Product added to wishlist",
        wishlist: @wishlist.as_json,
        item: wishlist_item.as_json
      }, status: :ok

    rescue ActiveRecord::RecordNotFound
      render json: { error: "Product not found" }, status: :not_found
    rescue ActiveRecord::RecordInvalid => e
      render json: {
        error: "Failed to add item to wishlist",
        details: e.record.errors.full_messages
      }, status: :unprocessable_entity
    end

    def remove_item
      raise ActiveRecord::RecordNotFound if current_user.wishlist.nil?

      wishlist_item = current_user.wishlist.wishlist_items.find(params[:id])
      wishlist_item.destroy!

      render json: {
        message: "Item removed from wishlist",
        wishlist: current_user.wishlist.as_json
      }, status: :ok

    rescue ActiveRecord::RecordNotFound
      render json: { error: "Wishlist item not found" }, status: :not_found
    end

    def clear
      @wishlist.clear_items

      render json: {
        message: "Wishlist cleared",
        wishlist: @wishlist.as_json
      }, status: :ok
    end

    private

    def ensure_wishlist
      @wishlist = current_user.wishlist || current_user.create_wishlist
    end
  end
end
