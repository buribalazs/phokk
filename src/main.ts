import Box2DFactory from 'box2d-wasm';

Box2DFactory().then(box2D => {
    console.log(box2D)

    const { b2BodyDef, b2_dynamicBody, b2PolygonShape, b2Vec2, b2World } = box2D;

    // in metres per second squared
    const gravity = new b2Vec2(0, 10);
    const world = new b2World(gravity);

    const sideLengthMetres = 1;
    const square = new b2PolygonShape();
    square.SetAsBox(sideLengthMetres / 2, sideLengthMetres / 2);

    const zero = new b2Vec2(0, 0);

    const bd = new b2BodyDef();
    bd.set_type(b2_dynamicBody);
    bd.set_position(zero);

    const body = world.CreateBody(bd);
    body.CreateFixture(square, 1);
    body.SetTransform(zero, 0);
    body.SetLinearVelocity(zero);
    body.SetAwake(true);
    body.SetEnabled(true);

    // calculate no more than a 60th of a second during one world.Step() call
    const maxTimeStepMs = 1 / 60 * 1000;
    const velocityIterations = 1;
    const positionIterations = 1;

    /**
     * Advances the world's physics by the requested number of milliseconds
     * @param {number} deltaMs
     */
    const step = (deltaMs) => {
        const clampedDeltaMs = Math.min(deltaMs, maxTimeStepMs);
        world.Step(clampedDeltaMs / 1000, velocityIterations, positionIterations);
    };

    /**
     * Prints out the vertical position of our falling square
     * (this is easier than writing a full renderer)
     */
    const whereIsOurSquare = () => {
        {
            const { x, y } = body.GetLinearVelocity();
            console.log("Square's velocity is:", x, y);
        }
        {
            const { x, y } = body.GetPosition();
            console.log("Square's position is:", x, y);
        }
    };

    // (function loop(prevMs) {
    //     const nowMs = window.performance.now();
    //     requestAnimationFrame(loop.bind(null, nowMs));
    //     const deltaMs = nowMs - prevMs;
    //     step(deltaMs);
    //     whereIsOurSquare();
    // }(window.performance.now()));
})