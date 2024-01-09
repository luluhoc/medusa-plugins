import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthProvider } from '../../types';

export const APPLE_STORE_STRATEGY_NAME = 'apple.store.medusa-auth-plugin';
export const APPLE_ADMIN_STRATEGY_NAME = 'apple.admin.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

export type AppleAuthOptions = {
	type: 'apple';
	clientID: string;
	keyId: string;
	teamId: string;
	privateKeyLocation: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/apple
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/apple/cb
		 */
		authCallbackPath?: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /store/auth/apple
		 */
		authPath?: string;
		/**
		 * Default /store/auth/apple/cb
		 */
		authCallbackPath?: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
};
