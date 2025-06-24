module.exports = (req, res) => {
  res.writeHead(302, { Location: 'https://harys.is-a.dev/' });
  res.end();
};
