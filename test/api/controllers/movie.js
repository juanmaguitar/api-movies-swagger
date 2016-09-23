var should = require('should');
var request = require('supertest-as-promised');
var server = require('../../../app');
var db = require('../../../api/controllers/movie').db;


var testMovie = function() {
  this.title = 'Back to the future';
  this.year = 1985;
};

function addTestMovie() {
  return request(server)
          .post('/movie')
          .send( new testMovie() )
}

function getMovie({ body: {id} }) {
  return request(server)
          .get(`/movie/${id}`)
}

beforeEach( (done) => {
  db.movieList = [];
  done();
})

describe('controllers', function() {

  describe('/movie', function() {

    describe('POST', function() {

      it('should insert a movie and return a json w/ success', function(done) {

        request(server)
          .post('/movie')
          .send( new testMovie() )
          .expect('Content-Type', /json/)
          .expect(200)
          .end( (err, response) => {

            should.not.exist(err);

            const { success, description, id } = response.body;

            success.should.equal(1);
            description.should.equal("Movie added to the list!");
            should.exist(id);

            done();

          });

      });

    }); // @end POST /movie

    describe('GET', function() {

      it('should return a json w/ list of movies', function(done) {

        addTestMovie()
          .then( (response) => {

            const idMovieAdded = response.body.id;

            request(server)
              .get('/movie')
              .expect('Content-Type', /json/)
              .expect(200)
              .end( (err, response) => {

                should.not.exist(err);

                const { title, year, id }  = response.body.movies[0];
                const movie = new testMovie();

                title.should.equal( movie.title );
                year.should.equal( movie.year );
                id.should.equal( idMovieAdded );

                done();
              });

          });

        }); // @end it

    }); // @end GET /movie

  }); // // @end /movie

  describe('/movie/{id}', function() {

    describe('GET', function() {

      it('should return details for that movie', function(done) {

        addTestMovie()
          .then( (response) => {

            const idMovieAdded = response.body.id;

            request(server)
              .get( `/movie/${idMovieAdded}`)
              .expect('Content-Type', /json/)
              .expect(200)
              .end( (err, response) => {

                should.not.exist(err);

                const { title, year, id }  = response.body;
                const movie = new testMovie();

                title.should.equal( movie.title );
                year.should.equal( movie.year );
                id.should.equal( idMovieAdded );

                done();
              });

          });

        }); // @end it

    }) // @end GET

    describe('PUT', function() {

      it('should update data of the movie', function(done) {

        addTestMovie()
          .then( (response) => {

            const idMovie = response.body.id;
            const updatedMovie = new testMovie();
            updatedMovie.year = 2006;

            request(server)
              .put(`/movie/${idMovie}`)
              .send( updatedMovie )
              .expect('Content-Type', /json/)
              .expect(200)
              .end( (err, response) => {

                should.not.exist(err);

                const { success, description } = response.body;

                success.should.equal(1);
                description.should.equal("Movie updated!");

                done();
              });

          });

        }); // @end it

    }) // @end PUT

    describe('DELETE', function() {

      it('should delete that movie', function(done) {

        addTestMovie()
          .then( getMovie )
          .then( (responseMovie) => {

            const { body: {id} } = responseMovie;

            request(server)
              .delete(`/movie/${id}`)
              .expect('Content-Type', /json/)
              .expect(200)
              .end( (err, response) => {

                should.not.exist(err);

                const { success, description } = response.body;

                success.should.equal(1);
                description.should.equal("Movie deleted!");

                getMovie(responseMovie)
                  .expect(204)
                  .end(done)

              });

          });

        }); // @end it

    }) // @end DELETE
  })

});
