import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(
    {
        plugins: [
            react()
        ],
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:8000',
                    changeOrigin: true,
                    secure: false,
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                                proxyReq.setHeader('Accept', 'application/json')
                            }
                        )
                    },
                },
            },
        },
    }
);
