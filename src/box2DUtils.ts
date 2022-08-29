
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

export function makeFoodAt(
    world: Box2D.b2World,
    x: number,
    y: number,
): Box2D.b2Body {
    const shape = new box2D.b2CircleShape();
    shape.set_m_radius(0.1)
    const bodyDef = new box2D.b2BodyDef();
    // bodyDef.set_type(box2D.b2_staticBody);
    const body = world.CreateBody(bodyDef);
    const fixture = body.CreateFixture(shape, 1);
    fixture.SetSensor(true)
    body.SetTransform(new box2D.b2Vec2(x, y), 0);
    return body
}

export function cloneVec2(vec:Box2D.b2Vec2){
    return new box2D.b2Vec2(vec.get_x(), vec.get_y())
}
