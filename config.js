module.exports = {
	//порты сервера ноды
	'portHttp': '80',
	//сервер  АД
	'adServer': 'ldap://elem-dc0.elem.ru',
	//домен
	'adBaseDN': 'dc=elem,dc=ru',
	//пользователь АД, имеющий доступ к АД. требуется для простого получения списка пользоватлей АД
	'adUser': 'gs2@elem.ru',
	//пароль пользователя АД
	'adPassword': 'gs2-1'
};