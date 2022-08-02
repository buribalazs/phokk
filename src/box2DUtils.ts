
let box2D: typeof Box2D & EmscriptenModule

export function initBox2DUtils(b: typeof box2D) {
    box2D = b
}

export function makeBoxAt(
    world: Box2D.b2World,
    x: number,
    y: number,
    w: number,
    h: number,
    rotation: number,
    type = box2D.b2_staticBody
): Box2D.b2Body {
    const shape = new box2D.b2PolygonShape();
    shape.SetAsBox(w, h);
    const floorBodyDef = new box2D.b2BodyDef();
    floorBodyDef.set_type(type);
    const floorBody = world.CreateBody(floorBodyDef);
    floorBody.CreateFixture(shape, 1);
    floorBody.SetTransform(new box2D.b2Vec2(x, y), rotation);
    floorBody.SetEnabled(true);
    return floorBody
}
