require "test_helper"

module Api
  class AuthenticationControllerTest < ActionDispatch::IntegrationTest
    def generate_token(user)
      payload = {
        user_id: user.id,
        role: user.role,
        exp: 24.hours.from_now.to_i
      }
      JWT.encode(payload, Rails.application.secret_key_base, "HS256")
    end

    test "register: should create user with valid params" do
      assert_difference("User.count", 1) do
        post api_register_url,
          params: {
            user: {
              email: "nuovo@example.com",
              password: "password123",
              password_confirmation: "password123",
              first_name: "Luca",
              last_name: "Bianchi"
            }
          },
          as: :json
      end

      assert_response :created
      json = JSON.parse(response.body)
      assert_equal "Registration successful", json["message"]
      assert_equal "user", json["user"]["role"]
      assert json["token"].present?
    end

    test "register: should fail with duplicate email" do
      existing = users(:regular_user)

      assert_no_difference("User.count") do
        post api_register_url,
          params: {
            user: {
              email: existing.email,
              password: "password123",
              password_confirmation: "password123",
              first_name: "Luca",
              last_name: "Bianchi"
            }
          },
          as: :json
      end

      assert_response :unprocessable_entity
      json = JSON.parse(response.body)
      assert_equal "Registration failed", json["error"]
      assert json["errors"].any? { |e| e.match?(/email/i) }
    end

    test "register: should fail with missing required fields" do
      assert_no_difference("User.count") do
        post api_register_url,
          params: { user: { email: "solo@example.com" } },
          as: :json
      end

      assert_response :unprocessable_entity
    end

    test "register: should fail with password shorter than 6 chars" do
      assert_no_difference("User.count") do
        post api_register_url,
          params: {
            user: {
              email: "nuovo2@example.com",
              password: "abc",
              password_confirmation: "abc",
              first_name: "Luca",
              last_name: "Bianchi"
            }
          },
          as: :json
      end

      assert_response :unprocessable_entity
      json = JSON.parse(response.body)
      assert json["errors"].any? { |e| e.match?(/password/i) }
    end

    test "register: should force role to user even if admin is passed" do
      post api_register_url,
        params: {
          user: {
            email: "hacker@example.com",
            password: "password123",
            password_confirmation: "password123",
            first_name: "Evil",
            last_name: "User",
            role: "admin"
          }
        },
        as: :json

      assert_response :created
      json = JSON.parse(response.body)
      assert_equal "user", json["user"]["role"]
    end

    test "register: should fail with invalid email format" do
      assert_no_difference("User.count") do
        post api_register_url,
          params: {
            user: {
              email: "not-an-email",
              password: "password123",
              password_confirmation: "password123",
              first_name: "Luca",
              last_name: "Bianchi"
            }
          },
          as: :json
      end

      assert_response :unprocessable_entity
    end

    test "login: should return token with valid credentials" do
      post api_login_url,
        params: { user: { email: "user@example.com", password: "password123" } },
        as: :json

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Login successful", json["message"]
      assert json["token"].present?
      assert_equal "user@example.com", json["user"]["email"]
    end

    test "login: should fail with wrong password" do
      post api_login_url,
        params: { user: { email: "user@example.com", password: "wrongpassword" } },
        as: :json

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Invalid email or password", json["error"]
    end

    test "login: should fail with non-existent email" do
      post api_login_url,
        params: { user: { email: "ghost@example.com", password: "password123" } },
        as: :json

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Invalid email or password", json["error"]
    end

    test "login: should work for admin user" do
      post api_login_url,
        params: { user: { email: "admin@example.com", password: "admin123" } },
        as: :json

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "admin", json["user"]["role"]
      assert json["token"].present?
    end

    test "me: should return current user with valid token" do
      user = users(:regular_user)
      token = generate_token(user)

      get api_me_url,
        headers: { "Authorization" => "Bearer #{token}" }

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal user.email, json["email"]
      assert_equal user.first_name, json["firstName"]
    end

    test "me: should return 401 without token" do
      get api_me_url

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Not authenticated", json["error"]
    end

    test "me: should return 401 with invalid token" do
      get api_me_url,
        headers: { "Authorization" => "Bearer token.falso.invalido" }

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Not authenticated", json["error"]
    end

    test "me: should return 401 with expired token" do
      user = users(:regular_user)
      payload = {
        user_id: user.id,
        role: user.role,
        exp: 1.hour.ago.to_i
      }
      expired_token = JWT.encode(payload, Rails.application.secret_key_base, "HS256")

      get api_me_url,
        headers: { "Authorization" => "Bearer #{expired_token}" }

      assert_response :unauthorized
    end

    # ---------------------------------------------------------------------------
    # Property-based test (Rantly): roundtrip del JWT. Per QUALSIASI payload
    # (user_id, role, scadenza futura), encode → decode con la stessa chiave
    # restituisce esattamente i claim originali; con una chiave diversa la
    # verifica della firma deve SEMPRE fallire.
    # ---------------------------------------------------------------------------

    test "JWT encode/decode roundtrips any payload and rejects wrong keys (PBT)" do
      property_of {
        [ range(1, 1_000_000), choose("user", "admin"), range(1, 10_000) ]
      }.check(50) do |user_id, role, minutes|
        exp = minutes.minutes.from_now.to_i
        payload = { user_id: user_id, role: role, exp: exp }
        token = JWT.encode(payload, Rails.application.secret_key_base, "HS256")

        decoded = JWT.decode(
          token, Rails.application.secret_key_base, true, { algorithm: "HS256" }
        ).first
        assert_equal user_id, decoded["user_id"]
        assert_equal role, decoded["role"]
        assert_equal exp, decoded["exp"]

        assert_raises(JWT::VerificationError) do
          JWT.decode(token, "wrong-secret", true, { algorithm: "HS256" })
        end
      end
    end
  end
end
