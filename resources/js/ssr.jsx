/* prettier-ignore */
import {
createInertiaApp
} from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { VagaryLeatherBackdrop } from './components/vagary-leather-backdrop';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', {
                eager: true,
            });
            return pages[`./pages/${name}.tsx`];
        },
        // prettier-ignore
        setup: ({ App, props }) => (
            <>
                {/* Mirrors the client entry so hydration matches when SSR is enabled. */}
                <VagaryLeatherBackdrop />
                <App {...props} />
            </>
        ),
    }),
);
