// Generated by CoffeeScript 1.3.1
(function() {
  var b2AABB, b2Body, b2BodyDef, b2CircleShape, b2ContactListener, b2DebugDraw, b2Fixture, b2FixtureDef, b2MassData, b2PolygonShape, b2Vec2, b2World, b2WorldManifold, _ref, _ref1, _ref2;

  b2Vec2 = Box2D.Common.Math.b2Vec2;

  _ref = Box2D.Dynamics, b2BodyDef = _ref.b2BodyDef, b2Body = _ref.b2Body, b2FixtureDef = _ref.b2FixtureDef, b2Fixture = _ref.b2Fixture, b2World = _ref.b2World, b2DebugDraw = _ref.b2DebugDraw, b2ContactListener = _ref.b2ContactListener;

  _ref1 = Box2D.Collision, b2AABB = _ref1.b2AABB, b2WorldManifold = _ref1.b2WorldManifold, (_ref2 = _ref1.Shapes, b2MassData = _ref2.b2MassData, b2PolygonShape = _ref2.b2PolygonShape, b2CircleShape = _ref2.b2CircleShape);

  /*
  # #Crafty.Box2D
  # @category Physics
  # Dealing with Box2D
  */


  Crafty.extend({
    Box2D: (function() {
      /*
          PRIVATE
      */

      var _SCALE, _setContactListener, _setDebugDraw, _toBeRemoved, _world;
      _SCALE = 30;
      /*
          # #Crafty.Box2D.world
          # @comp Crafty.Box2D
          # This will return the Box2D world object through a getter,
          # which is a container for bodies and joints.
          # It will have 0 gravity when initialized.
          # Gravity can be set through a setter:
          # Crafty.Box2D.gravity = {x: 0, y:10}
      */

      _world = null;
      /*
          A list of bodies to be destroyed in the next step. Usually during
          collision step, it's bad to destroy bodies.
      */

      _toBeRemoved = [];
      /* 
      Setting up contact listener to notify the concerned entities
      based on the ids in their body's user data that we set during
      the construction of the body. We don't keep track of the contact
      but let the entities handle the collision.
      */

      _setContactListener = function() {
        var contactListener;
        contactListener = new b2ContactListener;
        contactListener.BeginContact = function(contact) {
          var contactPoints, entityIdA, entityIdB, manifold;
          entityIdA = contact.GetFixtureA().GetBody().GetUserData();
          entityIdB = contact.GetFixtureB().GetBody().GetUserData();
          manifold = new b2WorldManifold();
          contact.GetWorldManifold(manifold);
          contactPoints = manifold.m_points;
          Crafty(entityIdA).trigger("BeginContact", {
            points: contactPoints,
            targetId: entityIdB
          });
          return Crafty(entityIdB).trigger("BeginContact", {
            points: contactPoints,
            targetId: entityIdA
          });
        };
        contactListener.EndContact = function(contact) {
          var entityIdA, entityIdB;
          entityIdA = contact.GetFixtureA().GetBody().GetUserData();
          entityIdB = contact.GetFixtureB().GetBody().GetUserData();
          Crafty(entityIdA).trigger("EndContact");
          return Crafty(entityIdB).trigger("EndContact");
        };
        return _world.SetContactListener(contactListener);
      };
      _setDebugDraw = function() {
        var canvas, debugDraw;
        if (Crafty.support.canvas) {
          canvas = document.createElement("canvas");
          canvas.id = "Box2DCanvasDebug";
          canvas.width = Crafty.viewport.width;
          canvas.height = Crafty.viewport.height;
          canvas.style.position = 'absolute';
          canvas.style.left = "0px";
          canvas.style.top = "0px";
          Crafty.stage.elem.appendChild(canvas);
          debugDraw = new b2DebugDraw();
          debugDraw.SetSprite(canvas.getContext('2d'));
          debugDraw.SetDrawScale(_SCALE);
          debugDraw.SetFillAlpha(0.7);
          debugDraw.SetLineThickness(1.0);
          debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_joinBit);
          return _world.SetDebugDraw(debugDraw);
        }
      };
      return {
        /*
            PUBLIC
        */

        /*
            # #Crafty.Box2D.debug
            # @comp Crafty.Box2D
            # This will determine whether to use Box2D's own debug Draw
        */

        debug: false,
        /*
            # #Crafty.Box2D.init
            # @comp Crafty.Box2D
            # @sign public void Crafty.Box2D.init(params)
            # @param options: An object contain settings for the world
            # Create a Box2D world. Must be called before any entities
            # with the Box2D component can be created
        */

        init: function(_arg) {
          var doSleep, gravityX, gravityY, scale, _ref3,
            _this = this;
          _ref3 = _arg != null ? _arg : {}, gravityX = _ref3.gravityX, gravityY = _ref3.gravityY, scale = _ref3.scale, doSleep = _ref3.doSleep;
          gravityX = gravityX != null ? gravityX : 0;
          gravityY = gravityY != null ? gravityY : 0;
          _SCALE = scale != null ? scale : 30;
          doSleep = doSleep != null ? doSleep : true;
          _world = new b2World(new b2Vec2(gravityX, gravityY), doSleep);
          this.__defineGetter__('world', function() {
            return _world;
          });
          this.__defineSetter__('gravity', function(v) {
            var body, _results;
            _world.SetGravity(new b2Vec2(v.x, v.y));
            body = _world.GetBodyList();
            _results = [];
            while (body != null) {
              body.SetAwake(true);
              _results.push(body = body.GetNext());
            }
            return _results;
          });
          this.__defineGetter__('gravity', function() {
            return _world.GetGravity();
          });
          this.__defineGetter__('SCALE', function() {
            return _SCALE;
          });
          _setContactListener();
          Crafty.bind("EnterFrame", function() {
            var body, _i, _len;
            _world.Step(1 / Crafty.timer.getFPS(), 10, 10);
            for (_i = 0, _len = _toBeRemoved.length; _i < _len; _i++) {
              body = _toBeRemoved[_i];
              _world.DestroyBody(body);
            }
            _toBeRemoved = [];
            if (_this.debug) {
              _world.DrawDebugData();
            }
            return _world.ClearForces();
          });
          return _setDebugDraw();
        },
        /*
            #Crafty.Box2D.destroy
            @comp Crafty.Box2D
            @sign public void Crafty.Box2D.destroy([b2Body body])
            @param body - The body to be destroyed. Destroy all if none
            Destroy all the bodies in the world. Internally, add to a list to destroy
            on the next step to avoid collision step.
        */

        destroy: function(body) {
          var _results;
          if (body != null) {
            return _toBeRemoved.push(body);
          } else {
            body = _world.GetBodyList();
            _results = [];
            while (body != null) {
              _toBeRemoved.push(body);
              _results.push(body = body.GetNext());
            }
            return _results;
          }
        }
      };
    })()
  });

  /*
  # #Box2D
  # @category Physics
  # Creates itself in a Box2D World. Crafty.Box2D.init() will be automatically called
  # if it is not called already (hence the world element doesn't exist).
  # In order to create a Box2D object, a body definition of position and dynamic is need.
  # The world will use this bodyDef to create a body. A fixture definition with geometry,
  # friction, density, etc is also required. Then create shapes on the body.
  # The body will be created during the .attr call instead of init.
  */


  Crafty.c("Box2D", (function() {
    /*
      PRIVATE
    */

    var _circle, _createBody, _fixDef, _polygon, _rectangle;
    _fixDef = null;
    _createBody = function(_arg) {
      var SCALE, bodyDef, density, friction, h, poly, r, restitution, type, w, x, y;
      x = _arg.x, y = _arg.y, w = _arg.w, h = _arg.h, r = _arg.r, poly = _arg.poly, type = _arg.type, density = _arg.density, friction = _arg.friction, restitution = _arg.restitution;
      SCALE = Crafty.Box2D.SCALE;
      bodyDef = new b2BodyDef;
      if ((type != null) && (type === "static" || type === "dynamic" || type === "kinematic")) {
        bodyDef.type = b2Body["b2_" + type + "Body"];
      }
      bodyDef.position.Set(x / SCALE, y / SCALE);
      this.body = Crafty.Box2D.world.CreateBody(bodyDef);
      this.body.SetUserData(this[0]);
      _fixDef = _fixDef != null ? _fixDef : new b2FixtureDef;
      _fixDef.density = density != null ? density : 1.0;
      _fixDef.friction = friction != null ? friction : 0.5;
      _fixDef.restitution = restitution != null ? restitution : 0.2;
      if (r != null) {
        return _circle.call(this, r);
      } else if ((w != null) || (h != null)) {
        w = w != null ? w : h;
        h = h != null ? h : w;
        return _rectangle.call(this, w, h);
      } else if (poly != null) {
        return _polygon.call(this, poly);
      }
    };
    _circle = function(radius) {
      var SCALE;
      if (!(this.body != null)) {
        return this;
      }
      SCALE = Crafty.Box2D.SCALE;
      if (this.body.GetFixtureList() != null) {
        this.body.DestroyFixture(this.body.GetFixtureList());
      }
      this._w = this._h = radius * 2;
      _fixDef.shape = new b2CircleShape(radius / SCALE);
      _fixDef.shape.SetLocalPosition(new b2Vec2(this.w / SCALE / 2, this.h / SCALE / 2));
      this.body.CreateFixture(_fixDef);
      return this;
    };
    _rectangle = function(w, h) {
      var SCALE;
      this.w = w;
      this.h = h;
      if (!(this.body != null)) {
        return this;
      }
      SCALE = Crafty.Box2D.SCALE;
      _fixDef.shape = new b2PolygonShape;
      _fixDef.shape.SetAsOrientedBox(w / 2 / SCALE, h / 2 / SCALE, new b2Vec2(w / 2 / SCALE, h / 2 / SCALE));
      this.body.CreateFixture(_fixDef);
      return this;
    };
    /*
      polygon([[50,0],[100,100],[0,100]])
      polygon([50,0],[100,100],[0,100])
    */

    _polygon = function(vertices) {
      var SCALE, convert, poly, vertex;
      if (arguments.length > 1) {
        vertices = Array.prototype.slice.call(arguments, 0);
      }
      SCALE = Crafty.Box2D.SCALE;
      _fixDef.shape = new b2PolygonShape;
      convert = function(pointAsArray) {
        var vec;
        return vec = new b2Vec2(pointAsArray[0] / SCALE, pointAsArray[1] / SCALE);
      };
      poly = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = vertices.length; _i < _len; _i++) {
          vertex = vertices[_i];
          _results.push(convert(vertex));
        }
        return _results;
      })();
      _fixDef.shape.SetAsArray((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = vertices.length; _i < _len; _i++) {
          vertex = vertices[_i];
          _results.push(convert(vertex));
        }
        return _results;
      })(), vertices.length);
      this.body.CreateFixture(_fixDef);
      return this;
    };
    return {
      /*
        PUBLIC
      */

      /*
        #.body
        @comp Box2D
        The `b2Body` from Box2D, created by `Crafty.Box2D.world` during `.attr({x, y})` call.
        Shape can be attached to it if more params added to `.attr` call, or through
        `.circle`, `.rectangle`, or `.polygon` method.
      */

      body: null,
      init: function() {
        var SCALE,
          _this = this;
        this.addComponent("2D");
        if (!(Crafty.Box2D.world != null)) {
          Crafty.Box2D.init();
        }
        SCALE = Crafty.Box2D.SCALE;
        /*
            Box2D entity is created by calling .attr({x, y, w, h}) or .attr({x, y, r}).
            That funnction triggers "Change" event for us to set box2d attributes.
        */

        this.bind("Change", function(attrs) {
          if (!(attrs != null)) {
            return;
          }
          if ((attrs.x != null) && (attrs.y != null)) {
            return _createBody.call(_this, attrs);
          }
        });
        /*
            This event is triggered when x,y,w or h changes, when physics body moves, or when entity
            is moved manually. To avoid conflict, we only allow manual movement when body is sleeping.
            Other components dealing with manual movement through inputs such as keyboard and mouse
            need to make it sleep before handling, then awake it when done.
        */

        this.bind("Move", function(_arg) {
          var _h, _w, _x, _y;
          _x = _arg._x, _y = _arg._y, _w = _arg._w, _h = _arg._h;
          if (!(_this.body != null) || (_this.body.GetType() === b2Body.b2_dynamicBody && _this.body.IsAwake())) {
            return;
          }
          if (_x !== _this.x || _y !== _this.y) {
            _this.body.SetPosition(new b2Vec2(_this.x / SCALE, _this.y / SCALE));
          }
          if (_w !== _this.w || _h !== _this.h) {
            /*
                    Reseting w and h is to resize, but Box2D does not scale.
                    When resizing, need to destroy initial shape, then add a new one
            */

            if (_this.body.GetFixtureList() != null) {
              _this.body.DestroyFixture(_this.body.GetFixtureList());
            }
            if (!(_this.r != null)) {
              return _rectangle.call(_this, _this.w, _this.h);
            } else {
              /*
                        As a collision body, I choose to make the circle fits inside the AABB.
                        Thus it must accomodate for the smaller side.
              */

              _this.r = _this.w < _this.h ? _this.w / 2 : _this.h / 2;
              return _circle.call(_this, _this.r);
            }
          }
        });
        /*
            Update the entity by using Box2D's attributes.
        */

        this.bind("EnterFrame", function() {
          var angle, pos;
          if ((_this.body != null) && _this.body.IsAwake()) {
            pos = _this.body.GetPosition();
            angle = Crafty.math.radToDeg(_this.body.GetAngle());
            if (pos.x * SCALE !== _this.x) {
              _this.x = pos.x * SCALE;
            }
            if (pos.y * SCALE !== _this.y) {
              _this.y = pos.y * SCALE;
            }
            if (angle !== _this.rotation) {
              return _this.rotation = angle;
            }
          }
        });
        /*
            Add this body to a list to be destroyed on the next step.
            This is to prevent destroying the bodies during collision.
        */

        return this.bind("Remove", function() {
          if (_this.body != null) {
            return Crafty.Box2D.destroy(_this.body);
          }
        });
      },
      /*
        #.circle
        @comp Box2D
        @sign public this .circle(Number radius)
        @param radius - The radius of the circle to create
        Attach a circle shape to entity's existing body.
        @example 
        ~~~
        this.attr({x: 10, y: 10, r:10}) // called internally
        this.attr({x: 10, y: 10}).circle(10) // called explicitly
        ~~~
      */

      circle: function(radius) {
        return _circle.call(this, radius);
      },
      /*
        #.rectangle
        @comp Box2D
        @sign public this .rectangle(Number w, Number h)
        @param w - The width of the rectangle to create
        @param h - The height of the rectangle to create
        Attach a rectangle or square shape to entity's existing body.
        @example 
        ~~~
        this.attr({x: 10, y: 10, w:10, h: 15}) // called internally
        this.attr({x: 10, y: 10}).rectangle(10, 15) // called explicitly
        this.attr({x: 10, y: 10}).rectangle(10, 10) // a square
        this.attr({x: 10, y: 10}).rectangle(10) // also square!!!
        ~~~
      */

      rectangle: function(w, h) {
        return _rectangle.call(this, w, h);
      },
      /*
        #.polygon
        @comp Box2D
        @sign public this .polygon(Array vertices)
        @sign public this .polygon(Array point, Array point[, Array point...])
        @param vertices - vertices array as an argument where index 0 is the x position
        and index 1 is the y position. Can also simply put each point as an argument.
        Attach a polygon to entity's existing body. When creating a polygon for an entity,
        each point should be offset or relative from the entities `x` and `y`
        @example
        ~~~
        this.attr({x: 10, y: 10}).polygon([[50,0],[100,100],[0,100]])
        this.attr({x: 10, y: 10}).polygon([50,0],[100,100],[0,100])
      */

      polygon: function(vertices) {
        return _polygon.call(this, vertices);
      },
      /*
        #.hit
        @comp Box2D
        @sign public Boolean/Array hit(String component)
        @param component - Component to check collisions for
        @return `false if no collision. If a collision is detected, return an Array of
        objects that are colliding, with the type of collision, and the contact points.
        The contact points has at most two points for polygon and one for circle.
        ~~~
        [{
          obj: [entity],
          type: "Box2D",
          points: [Vector[, Vector]]
        }]
      */

      hit: function(component) {
        var contactEdge, contactPoints, finalresult, manifold, otherEntity, otherId;
        contactEdge = this.body.GetContactList();
        if (!(contactEdge != null)) {
          return false;
        }
        otherId = contactEdge.other.GetUserData();
        otherEntity = Crafty(otherId);
        if (!otherEntity.has(component)) {
          return false;
        }
        if (!contactEdge.contact.IsTouching()) {
          return false;
        }
        finalresult = [];
        manifold = new b2WorldManifold();
        contactEdge.contact.GetWorldManifold(manifold);
        contactPoints = manifold.m_points;
        finalresult.push({
          obj: otherEntity,
          type: "Box2D",
          points: contactPoints
        });
        return finalresult;
      },
      /*
        #.onHit
        @comp Box2D
        @sign public this .onHit(String component, Function beginContact[, Function endContact])
        @param component - Component to check collisions for
        @param beginContact - Callback method to execute when collided with component, 
        @param endContact - Callback method executed once as soon as collision stops
        Invoke the callback(s) if collision detected through contact listener. We don't bind
        to EnterFrame, but let the contact listener in the Box2D world notify us.
      */

      onHit: function(component, beginContact, endContact) {
        var _this = this;
        if (component !== "Box2D") {
          return this;
        }
        this.bind("BeginContact", function(data) {
          var hitData;
          hitData = [
            {
              obj: Crafty(data.targetId),
              type: "Box2D",
              points: data.points
            }
          ];
          return beginContact.call(_this, hitData);
        });
        if (typeof endContact === "function") {
          this.bind("EndContact", function() {
            return endContact.call(_this);
          });
        }
        return this;
      }
    };
  })());

}).call(this);
