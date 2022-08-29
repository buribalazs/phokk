import Box2DFactory from 'box2d-wasm';
import { makeDebugDraw } from './debugDraw.js'
import { initBox2DUtils, makeBoxAt, cloneVec2, makeFoodAt } from './box2DUtils'

Box2DFactory().then(box2D => {
    initBox2DUtils(box2D)

    const { b2BodyDef, b2_dynamicBody, b2_kinematicBody, b2CircleShape, b2PolygonShape, b2Vec2, b2World } = box2D;

    // in metres per second squared
    const gravity = new b2Vec2(0, 10);
    const world = new b2World(gravity);

    const canvas = document.getElementById("demo-canvas") as HTMLCanvasElement;
    // canvas.addEventListener('contextmenu', e => e.preventDefault())
    const ctx = canvas.getContext('2d');

    const pixelsPerMeter = 160;
    const cameraOffsetMetres = {
        x: 0,
        y: 0
    };

    const debugDraw = makeDebugDraw(ctx, pixelsPerMeter, box2D);
    world.SetDebugDraw(debugDraw);

    const ballShape = new b2CircleShape();
    ballShape.set_m_radius(0.1)
    const ballBodyDef = new b2BodyDef();
    ballBodyDef.set_type(b2_dynamicBody);
    const ball = world.CreateBody(ballBodyDef);
    const ballFixture = ball.CreateFixture(ballShape, 1);
    ballFixture.SetRestitution(0.6)
    ball.SetTransform(new b2Vec2(2, 2), 1);
    ball.SetBullet(true);

    const pendulumShape = new b2CircleShape();
    pendulumShape.set_m_radius(0.05)
    const pendulumBodyDef = new b2BodyDef();
    pendulumBodyDef.set_type(b2_kinematicBody);
    const pendulum = world.CreateBody(pendulumBodyDef);
    const pendulumFixture = pendulum.CreateFixture(pendulumShape, 1);
    const pendulumFilterData = new box2D.b2Filter();
    pendulumFilterData.set_categoryBits(0);
    pendulumFixture.SetFilterData(pendulumFilterData);
    pendulum.SetTransform(new b2Vec2(2, 1.5), 1);

    const floor = makeBoxAt(world, 2, 4, 2, 0.1, 0)
    const ceiling = makeBoxAt(world, 2, 0, 2, 0.1, 0)
    const leftWall = makeBoxAt(world, 0, 2, 0.1, 1.9, 0)
    const rightWall = makeBoxAt(world, 4, 2, 0.1, 1.9, 0)

    const food = makeFoodAt(world, 0, 0)
    let foodHit = false;
    const placeFood = () => {
        food.SetTransform(new b2Vec2(0.4 + 3.2 * Math.random(), 0.4 + 3.2 * Math.random()),0);
    }
    placeFood();
    


    // calculate no more than a 60th of a second during one world.Step() call
    const maxTimeStepMs = 1 / 60 * 1000;
    const velocityIterations = 2;
    const positionIterations = 2;

    /**
     * Advances the world's physics by the requested number of milliseconds
     * @param {number} deltaMs
     */
    const step = (deltaMs) => {
        const clampedDeltaMs = Math.min(deltaMs, maxTimeStepMs);
        world.Step(clampedDeltaMs / 1000, velocityIterations, positionIterations);
    };


    const drawCanvas = () => {
        ctx.closePath()

        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(pixelsPerMeter, pixelsPerMeter);
        const { x, y } = cameraOffsetMetres;
        ctx.translate(x, y);
        ctx.lineWidth = 2 / pixelsPerMeter;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';

        
        {
            const {x,y} = ball.GetPosition();
            ctx.beginPath()
            ctx.strokeRect(0.1,0.1,3.8,3.8)
            ctx.arc(x,y,ballShape.m_radius,0,Math.PI * 2);
            // ctx.stroke()
            ctx.fill()
        }

        {
            const {x,y} = pendulum.GetPosition();
            ctx.beginPath()
            // ctx.fillStyle = 'white';
            // ctx.strokeStyle = 'white';
            ctx.arc(x,y,pendulumShape.m_radius,0,Math.PI * 2);
            ctx.stroke()
            // ctx.fill()
        }

        {
            const {x,y} = food.GetPosition();
            ctx.beginPath()
            // ctx.fillStyle = 'white';
            // ctx.strokeStyle = 'white';
            ctx.setLineDash([0.024,0.024])
            ctx.arc(x,y,0.1,0,Math.PI * 2);
            ctx.stroke()
            ctx.setLineDash([]);
            // ctx.fill()
        }

        ctx.fillStyle = 'rgb(255,255,255)';
        // world.DebugDraw();

        ctx.restore();
    };

    let mouseDown = false;
    document.body.addEventListener('mousedown', () => {
        mouseDown = true;
    });
    document.body.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    document.body.addEventListener('mouseleave', () => {
        mouseDown = false;
    });


    let time = 0;
    const contactListener = new box2D.JSContactListener();
    contactListener.BeginContact = (_contact:number) =>{
        const contact = box2D.wrapPointer(_contact, box2D.b2Contact);
        const ab = [contact.GetFixtureA().GetBody(), contact.GetFixtureB().GetBody()]
        if(ab.includes(ball) && ab.includes(food)){
            foodHit = true;
        }
    }
    contactListener.PreSolve = ()=>{}
    contactListener.PostSolve = ()=>{}
    contactListener.EndContact = ()=>{}
    world.SetContactListener(contactListener);

    (function loop(prevMs) {
        const nowMs = window.performance.now();
        requestAnimationFrame(loop.bind(null, nowMs));
        const deltaMs = nowMs - prevMs;
        time += deltaMs;
        
        pendulum.SetTransform(new b2Vec2(Math.sin(time * 0.0015) * 1.5 + 2,1.5),0);
        if(foodHit){
            foodHit = false;
            placeFood();
        }
        if (mouseDown){
            let vec = cloneVec2(pendulum.GetPosition());
            vec.op_sub(ball.GetPosition())
            const mul = 4 - vec.Length()
            const mag = deltaMs * 0.0005 + mul * 0.001;
            vec.Normalize()
            vec.op_mul(mag)
            vec.set_y(vec.y * 1.5);
            ball.ApplyLinearImpulseToCenter(vec, true)
        }
        step(deltaMs);
        
        
        drawCanvas();
    }(window.performance.now()));

})