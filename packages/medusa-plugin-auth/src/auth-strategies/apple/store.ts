import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as AppleStrategy } from 'passport-apple';
import { PassportStrategy } from '../../core/passport/Strategy';
import { APPLE_STORE_STRATEGY_NAME, AppleAuthOptions, Profile } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';
import { AuthProvider, StrategyFactory } from '../../types';

export function getAppleStoreStrategy(id: string): StrategyFactory<AppleAuthOptions> {
	const strategyName = `${APPLE_STORE_STRATEGY_NAME}_${id}`;
	return class AppleStoreStrategy extends PassportStrategy(AppleStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: AppleAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				clientID: strategyOptions.clientID,
				teamID: strategyOptions.teamId,
				keyID: strategyOptions.keyId,
				callbackURL: strategyOptions.store.callbackUrl,
				passReqToCallback: true,
			}, strategyOptions.privateKeyLocation);
		}

		async validate(
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile
		): Promise<null | { id: string }> {
			if (this.strategyOptions.store.verifyCallback) {
				return await this.strategyOptions.store.verifyCallback(
					this.container,
					req,
					accessToken,
					refreshToken,
					profile,
					this.strict
				);
			}

			return await validateStoreCallback(profile, {
				container: this.container,
				strategyErrorIdentifier: 'apple',
				strict: this.strict,
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the google store authentication routes
 * @param id
 * @param google
 * @param configModule
 */
export function getAppleStoreAuthRouter(id: string, apple: AppleAuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${APPLE_STORE_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: apple.store.authPath ?? '/store/auth/apple',
		authCallbackPath: apple.store.authCallbackPath ?? '/store/auth/apple/cb',
		successRedirect: apple.store.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: ['name', 'email']
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: apple.store.failureRedirect,
		},
		expiresIn: apple.store.expiresIn,
	});
}
