// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	i18n: {
		locales: ["ru", "en"],
		defaultLocale: "ru",
	},
	integrations: [
		starlight({
			title: 'Vue Modeler',
			description: 'Мощная библиотека для управления состоянием в Vue.js приложениях',
			social: {
				github: 'https://github.com/your-username/vue-modeler',
			},
			sidebar: [
				{
					label: 'Введение',
					items: [
						{ label: 'Что такое model', link: '/introduction/' },
						{ label: 'Установка', link: '/installation/' },
						{ label: 'Быстрый старт', link: '/getting-started/' },
					],
				},
				{
					label: 'Основы',
					items: [
						{ label: 'Модели', link: '/guides/models/' },
						{ label: 'Действия', link: '/guides/actions/' },
						{ label: 'Состояния', link: '/guides/states/' },
						{ label: 'Декораторы', link: '/guides/decorators/' },
					],
				},
				{
					label: 'Продвинутые темы',
					items: [
						{ label: 'Обработка ошибок', link: '/guides/error-handling/' },
						{ label: 'Отмена операций', link: '/guides/abort/' },
						{ label: 'Блокировка действий', link: '/guides/locking/' },
						{ label: 'Жизненный цикл', link: '/guides/lifecycle/' },
					],
				},
				{
					label: 'Примеры',
					items: [
						{ label: 'Простой пример', link: '/examples/simple/' },
						{ label: 'CRUD операции', link: '/examples/crud/' },
					],
				},
				{
					label: 'Справочник',
					items: [
						{ label: 'model', link: '/reference/model/' },
						{ label: 'ProtoModel', link: '/reference/proto-model/' },
						{ label: 'Action', link: '/reference/action/' },
						{ label: '@action', link: '/reference/action-decorator/' },
					],
				},
			],
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'icon',
						type: 'image/svg+xml',
						href: '/favicon.svg',
					},
				},
			],
		}),
	],
});

