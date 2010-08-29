from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class GameStorageEndpoint(webapp.RequestHandler):
    def get(self, path):
        self.response.headers["Content-Type"] = "text/plain"
        self.response.out.write("get @ " + path)
    def put(self, path):
        self.response.headers['Content-Type'] = "text/plain"
        self.response.out.write("put @ " + path)
    def post(self, path):
        self.response.headers['Content-Type'] = "text/plain"
        self.response.out.write("post @ " + path)
    def delete(self, path):
        self.response.headers['Content-Type'] = "text/plain"
        self.response.out.write("delete @ " + path)

application = webapp.WSGIApplication(
    [('/game/(.*)', GameStorageEndpoint)],
    debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
