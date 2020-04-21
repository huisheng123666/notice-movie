const mongoose = require('mongoose')

const Schema = mongoose.Schema

const movieSchema = new Schema({
  id: String,
  cover_x: Number,
  title: String,
  url: String,
  cover: String,
  playable: Boolean,
  cover_y: Number,
  is_new: Boolean,
  directory: String,
  writer: String,
  type: String,
  country: String,
  language: String,
  rate: String,
  open_time: String,
  description: String,
  actors: Array,
  video_url: String,
  tag: String
})

mongoose.model('Movie', movieSchema)
