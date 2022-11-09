import passport from 'passport';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import { AUTH_TOKEN_COOKIE_NAME } from '../types';

export function loadJwtOverrideStrategy(configModule: ConfigModule): void {
	const { jwt_secret } = configModule.projectConfig;
	passport.use(
		'jwt.medusa-plugin-auth',
		new JWTStrategy(
			{
				jwtFromRequest: (req) => req.cookies[AUTH_TOKEN_COOKIE_NAME] ?? req.session.jwt,
				secretOrKey: jwt_secret,
			},
			async (jwtPayload, done) => {
				return done(null, jwtPayload);
			}
		)
	);

	const middlewares = require('@medusajs/medusa/dist/api/middlewares/index');
	middlewares.default.authenticate = () => {
		return (req, res, next) => {
			passport.authenticate(['jwt.medusa-plugin-auth', 'bearer'], { session: false })(req, res, next);
		};
	};
	middlewares.default.authenticateCustomer = () => {
		return (req, res, next) => {
			passport.authenticate(['jwt.medusa-plugin-auth', 'bearer'], { session: false }, (err, user) => {
				if (err) {
					return next(err);
				}
				req.user = user;
				return next();
			})(req, res, next);
		};
	};
}