[![Build Status](https://travis-ci.org/evandvlad/rebus.svg)](https://travis-ci.org/evandvlad/rebus)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/9822f292909f46a3877bdc00b165c498)](https://www.codacy.com/app/evandvlad/rebus)
[![Codacy Badge](https://api.codacy.com/project/badge/coverage/9822f292909f46a3877bdc00b165c498)](https://www.codacy.com/app/evandvlad/rebus)

Библиотека для сборки регулярных выражений из строк и других регулярных выражений.

Конструктор Rebus не принимает параметров. Каждый экземпляр Rebus имеет свое пространство переменных.

#### Методы Rebus ####

##### defvar #####
Задание переменной. Метод принимает ключ, который будет являться именем переменной и в качестве второго параметра - 
регулярное выражение или строку, которое будет являться значением.

    var rebus = new Rebus();
    
    rebus.defvar('a', 'string');
    rebus.defvar('b', new RegExp('\\w'));
    rebus.defvar('c', /\w/);
    
Ключом должно быть значение удовлетворяющее регулярному выражению - /[a-z][a-z\d]*/i
и ранее не заданное в реестр. Если регулярное выражение было задано с модификаторами, то они отбрасываются.

##### compile #####
Метод компиляции. Метод принимает шаблон и модификаторы и возвращает регулярное выражение. В шаблоне могут быть 
использованы ранее определенные переменные (определенные с помощью метода defvar). Получить доступ к ранее
зарегистрированным переменным можно с помощью синтаксиса - @{varname}. В шаблоне разрешается использовать пробельные 
символы, в процессе обработки они вырезаются.

    var rebus = new Rebus();
    
    rebus.defvar('S', '@');
    rebus.defvar('V', /[a-z][a-z\d]*/);
    rebus.compile('^ @{S} \{ @{V} \} $', 'i');

#### Пример ####

    var rebus = new Rebus();
    
    rebus.defvar('digit', /\d/);
    rebus.defvar('letter', /[a-z]/);
    rebus.defvar('sign', /[_$]/);
    rebus.defvar('head', rebus.compile('(@{sign} | @{letter})'));
    rebus.defvar('tail', rebus.compile('(@{head} | @{digit})'));

    rebus.compile('^ @{head} @{tail}* $', 'i');
