import { chai } from "chai";
import { chaihttp } from "chai-http";
import {  startServer,app} from "../server/startServer";

// Configure chai
chai.use(chaiHttp);
chai.should();



describe("Users", () => {
    describe("GET /users", () => {
        // Test to get all users records
        it("should get all users records", (done) => {
             chai.request(startServer)
                 .get('/users')
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                     done();
                  });
         });
        // Test to get single student record
        it("should get a single user record", (done) => {
             const id = "181c06b4-13bb-445f-858a-92598007d2be";
             chai.request(app)
                 .get(`/users/:${id}`)
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                     done();
                  });
         });
         
        // Test to get single user record
        it("should not get a single user record", (done) => {
             const id = 5;
             chai.request(app)
                 .get(`/users/:${id}`)
                 .end((err, res) => {
                     res.should.have.status(404);
                     done();
                  });
         });
    });
});