const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const prisma = require("../models");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

module.exports = new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: jwt_payload.email,
            },
            select: {
                id: true,
                email: true,
                author: true,
            },
        });

        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(null, false);
    }
});
