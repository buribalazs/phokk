import Box2DFactory from 'box2d-wasm';
import { makeDebugDraw } from './debugDraw.js'
import { initBox2DUtils, makeBoxAt } from './box2DUtils'

Box2DFactory().then(box2D => {
    initBox2DUtils(box2D)

    const { b2BodyDef, b2_dynamicBody, b2_staticBody, b2CircleShape, b2PolygonShape, b2Vec2, b2World } = box2D;

    // in metres per second squared
    const gravity = new b2Vec2(0, 10);
    const world = new b2World(gravity);

    const canvas = document.getElementById("demo-canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const pixelsPerMeter = 160;
    const cameraOffsetMetres = {
        x: 0,
        y: 0
    };

    const debugDraw = makeDebugDraw(ctx, pixelsPerMeter, box2D);
    world.SetDebugDraw(debugDraw);

    const ball = new b2CircleShape();
    ball.set_m_radius(0.1)

    const zero = new b2Vec2(0, 0);

    const bd = new b2BodyDef();
    bd.set_type(b2_dynamicBody);

    const body = world.CreateBody(bd);
    
    const ballFixture = body.CreateFixture(ball, 1);
    ballFixture.SetRestitution(0.7)
    body.SetTransform(new b2Vec2(2, 2), 1);
    body.SetLinearVelocity(zero);
    body.SetAwake(true);
    body.SetEnabled(true);

    const floor = makeBoxAt(world, 2, 4, 2, 0.1, 0)


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


    const drawCanvas = () => {
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(pixelsPerMeter, pixelsPerMeter);
        const { x, y } = cameraOffsetMetres;
        ctx.translate(x, y);
        ctx.lineWidth /= pixelsPerMeter;

        ctx.fillStyle = 'rgb(255,255,255)';
        world.DebugDraw();

        ctx.restore();
    };


    (function loop(prevMs) {
        const nowMs = window.performance.now();
        requestAnimationFrame(loop.bind(null, nowMs));
        const deltaMs = nowMs - prevMs;
        step(deltaMs);
        drawCanvas();
    }(window.performance.now()));
})