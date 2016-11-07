module.exports = {
	//порты сервера ноды
	'portHttp': '7070',
	//сервер  АД
	'adServer': 'ldap://elem-dc1.elem.ru',
	//домен
	'adBaseDN': 'dc=elem,dc=ru',
	//пользователь АД, имеющий доступ к АД. требуется для простого получения списка пользоватлей АД
	'adUser': 'gs2@elem.ru',
	'accessGroup': 'PpmMap',
	//пароль пользователя АД
	'adPassword': 'gs2-1',
	'cookieSecret': '03836880c1e13cd15430a9b3fc6f04a5eb2ee12330148ac6695813ca73f1880c7d15b671d7dbb57e10e74de719ce1b66905042446a12be04981807194391bcef',
	'dbHost' : '10.1.255.117',
	'dbDatabase' : 'ppm-map',
	'dbUser': 'release',
	'dbPassword': 'uR33eNbdYfs',
	'sap' : 'https://sap-prx.ugmk.com:443/ummc/zkart/main?sap-user=skud_uem&sap-password=sRec137K'
};
