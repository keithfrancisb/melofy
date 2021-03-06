# == Schema Information
#
# Table name: artists
#
#  id          :bigint(8)        not null, primary key
#  name        :string           not null
#  description :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Artist < ApplicationRecord

  validates :name, presence: true

  has_many :songs
  has_many :albums

  has_many :saves,
    as: :saveable,
    class_name: :Save

  has_many :savers,
    through: :saves,
    source: :saver

end
