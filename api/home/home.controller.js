class HomeController {
  home(req, res) {
    res.json({
      _links: {
        self: {
          href: "/"
        }
    })
  }
}

module.exports = HomeController
