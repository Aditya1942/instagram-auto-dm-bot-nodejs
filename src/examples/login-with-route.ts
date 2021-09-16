app.post("/login", async (req, res) => {
  const ig = new IgApiClient();

  const { username, password } = req.body;

  ig.state.generateDevice(req.body.username);

  if (await exists(username)) {
    console.log(`${username} doesn't need to login again!`);

    const hashedPassword = await loadPassword(username);

    if (await compare(password, hashedPassword)) {
      await ig.state.deserialize(await load(username));
      await ig.user.info(ig.state.cookieUserId);
      await ig.user.info(ig.state.cookieUserId);

      const token = sign(
        {
          username: username,
        },
        process.env.TOKEN_SECRET
      );

      res.status(200).json({ token, message: "Already logged in!" });
    } else {
      // Delete the session if you want to
      // await deleteSession(username);

      res.status(401).json({ message: "Unauthrozied!" });
    }
  } else {
    console.log(`${username} needs to login again!`);

    ig.request.end$.subscribe(async () => {
      const serialized = await ig.state.serialize();
      delete serialized.constants;
      await save(req.body, JSON.stringify(serialized));
    });

    await ig.account.login(username, password);

    const token = sign(
      {
        username: username,
      },
      process.env.TOKEN_SECRET
    );

    res.status(200).json({ token, message: "Successfully logged in!" });
  }
});
