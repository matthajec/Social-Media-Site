module.exports = (path) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      res.redirect(path);
    }

    next();
  };
};
