module.exports = (path) => {
  return (req, res, next) => {
    if (req.session.userId) {
      return res.redirect(path);
    }

    next();
  };
};
