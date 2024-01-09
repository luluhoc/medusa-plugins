import { Strategy as GoogleStrategy, StrategyOptionsWithRequest } from 'passport-google-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { APPLE_ADMIN_STRATEGY_NAME, AppleAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';

export function getGoogleAdminStrategy(id: string): StrategyFactory<AppleAuthOptions> {
	const strategyName = `${APPLE_ADMIN_STRATEGY_NAME}_${id}`;
	return class GoogleAdminStrategy extends PassportStrategy(GoogleStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: AppleAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				clientID: strategyOptions.clientID,
				clientSecret: strategyOptions.keyId,
				callbackURL: strategyOptions.admin.callbackUrl,
				passReqToCallback: true,
			} as StrategyOptionsWithRequest);
		}

		async validate(
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile
		): Promise<null | { id: string }> {
			if (this.strategyOptions.admin.verifyCallback) {
				return await this.strategyOptions.admin.verifyCallback(
					this.container,
					req,
					accessToken,
					refreshToken,
					profile,
					this.strict
				);
			}

			return await validateAdminCallback(profile, {
				container: this.container,
				strategyErrorIdentifier: 'google',
				strict: this.strict,
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the google admin authentication routes
 * @param id
 * @param google
 * @param configModule
 */
export function getGoogleAdminAuthRouter(id: string, google: AppleAuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${APPLE_ADMIN_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: google.admin.authPath ?? '/admin/auth/google',
		authCallbackPath: google.admin.authCallbackPath ?? '/admin/auth/google/cb',
		successRedirect: google.admin.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: google.admin.failureRedirect,
		},
		expiresIn: google.admin.expiresIn,
	});
}
