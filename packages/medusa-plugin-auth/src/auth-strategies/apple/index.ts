import { StrategyExport } from '../../types';
import { Router } from 'express';
import { getGoogleAdminAuthRouter, getGoogleAdminStrategy } from './admin';
import { getAppleStoreAuthRouter, getAppleStoreStrategy } from './store';
import { AppleAuthOptions } from './types';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container, configModule, options): void => {
		const id = options.identifier ?? options.type;
		if (options.admin) {
			const Clazz = getGoogleAdminStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}

		if (options.store) {
			const Clazz = getAppleStoreStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}
	},
	getRouter: (configModule, options): Router[] => {
		const id = options.identifier ?? options.type;
		const routers = [];

		if (options.admin) {
			routers.push(getGoogleAdminAuthRouter(id, options, configModule));
		}

		if (options.store) {
			routers.push(getAppleStoreAuthRouter(id, options, configModule));
		}

		return routers;
	},
} as StrategyExport<AppleAuthOptions>;
