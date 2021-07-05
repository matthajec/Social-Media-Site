module.exports = (path) => {
  return (req, res, next) => {
    if (!req.session) {
      return res.redirect(path);
    }

    if (!req.session.userId) {
      return res.redirect(path);
    }

    next();
  };
};
