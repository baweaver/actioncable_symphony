# Old model, reconcile later
#
# class User < ApplicationRecord
#   # Include default devise modules. Others available are:
#   # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
#   devise :database_authenticatable, :registerable,
#          :recoverable, :rememberable, :validatable
# end

class User < ApplicationRecord
  devise(
    :database_authenticatable,
    :jwt_authenticatable,
    :registerable,
    jwt_revocation_strategy: JWTBlacklist
  )

  validates :username, uniqueness: true
end
