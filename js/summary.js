String.prototype.removeStopWords = function() {
	var x;
	var y;
	var word;
	var stop_word;
	var regex_str;
	var regex;
	var cleansed_string = this.valueOf();
	var stop_words = new Array(
		'a',
		'about',
		'above',
		'across',
		'after',
		'again',
		'against',
		'all',
		'almost',
		'alone',
		'along',
		'already',
		'also',
		'although',
		'always',
		'among',
		'an',
		'and',
		'another',
		'any',
		'anybody',
		'anyone',
		'anything',
		'anywhere',
		'are',
		'area',
		'areas',
		'around',
		'as',
		'ask',
		'asked',
		'asking',
		'asks',
		'at',
		'away',
		'b',
		'back',
		'backed',
		'backing',
		'backs',
		'be',
		'became',
		'because',
		'become',
		'becomes',
		'been',
		'before',
		'began',
		'behind',
		'being',
		'beings',
		'best',
		'better',
		'between',
		'big',
		'both',
		'but',
		'by',
		'c',
		'came',
		'can',
		'cannot',
		'case',
		'cases',
		'certain',
		'certainly',
		'clear',
		'clearly',
		'come',
		'could',
		'd',
		'did',
		'differ',
		'different',
		'differently',
		'do',
		'does',
		'done',
		'down',
		'down',
		'downed',
		'downing',
		'downs',
		'during',
		'e',
		'each',
		'early',
		'either',
		'end',
		'ended',
		'ending',
		'ends',
		'enough',
		'even',
		'evenly',
		'ever',
		'every',
		'everybody',
		'everyone',
		'everything',
		'everywhere',
		'f',
		'face',
		'faces',
		'fact',
		'facts',
		'far',
		'felt',
		'few',
		'find',
		'finds',
		'first',
		'for',
		'four',
		'from',
		'full',
		'fully',
		'further',
		'furthered',
		'furthering',
		'furthers',
		'g',
		'gave',
		'general',
		'generally',
		'get',
		'gets',
		'give',
		'given',
		'gives',
		'go',
		'going',
		'good',
		'goods',
		'got',
		'great',
		'greater',
		'greatest',
		'group',
		'grouped',
		'grouping',
		'groups',
		'h',
		'had',
		'has',
		'have',
		'having',
		'he',
		'her',
		'here',
		'herself',
		'high',
		'high',
		'high',
		'higher',
		'highest',
		'him',
		'himself',
		'his',
		'how',
		'however',
		'i',
		'if',
		'important',
		'in',
		'interest',
		'interested',
		'interesting',
		'interests',
		'into',
		'is',
		'it',
		'its',
		'itself',
		'j',
		'just',
		'k',
		'keep',
		'keeps',
		'kind',
		'knew',
		'know',
		'known',
		'knows',
		'l',
		'large',
		'largely',
		'last',
		'later',
		'latest',
		'least',
		'less',
		'let',
		'lets',
		'like',
		'likely',
		'long',
		'longer',
		'longest',
		'm',
		'made',
		'make',
		'making',
		'man',
		'many',
		'may',
		'me',
		'member',
		'members',
		'men',
		'might',
		'more',
		'most',
		'mostly',
		'mr',
		'mrs',
		'much',
		'must',
		'my',
		'myself',
		'n',
		'necessary',
		'need',
		'needed',
		'needing',
		'needs',
		'never',
		'new',
		'new',
		'newer',
		'newest',
		'next',
		'no',
		'nobody',
		'non',
		'noone',
		'not',
		'nothing',
		'now',
		'nowhere',
		'number',
		'numbers',
		'o',
		'of',
		'off',
		'often',
		'old',
		'older',
		'oldest',
		'on',
		'once',
		'one',
		'only',
		'open',
		'opened',
		'opening',
		'opens',
		'or',
		'order',
		'ordered',
		'ordering',
		'orders',
		'other',
		'others',
		'our',
		'out',
		'over',
		'p',
		'part',
		'parted',
		'parting',
		'parts',
		'per',
		'perhaps',
		'place',
		'places',
		'point',
		'pointed',
		'pointing',
		'points',
		'possible',
		'present',
		'presented',
		'presenting',
		'presents',
		'problem',
		'problems',
		'put',
		'puts',
		'q',
		'quite',
		'r',
		'rather',
		'really',
		'right',
		'right',
		'room',
		'rooms',
		's',
		'said',
		'same',
		'saw',
		'say',
		'says',
		'second',
		'seconds',
		'see',
		'seem',
		'seemed',
		'seeming',
		'seems',
		'sees',
		'several',
		'shall',
		'she',
		'should',
		'show',
		'showed',
		'showing',
		'shows',
		'side',
		'sides',
		'since',
		'small',
		'smaller',
		'smallest',
		'so',
		'some',
		'somebody',
		'someone',
		'something',
		'somewhere',
		'state',
		'states',
		'still',
		'still',
		'such',
		'sure',
		't',
		'take',
		'taken',
		'than',
		'that',
		'the',
		'their',
		'them',
		'then',
		'there',
		'therefore',
		'these',
		'they',
		'thing',
		'things',
		'think',
		'thinks',
		'this',
		'those',
		'though',
		'thought',
		'thoughts',
		'three',
		'through',
		'thus',
		'to',
		'today',
		'together',
		'too',
		'took',
		'toward',
		'turn',
		'turned',
		'turning',
		'turns',
		'two',
		'u',
		'under',
		'until',
		'up',
		'upon',
		'us',
		'use',
		'used',
		'uses',
		'v',
		'very',
		'w',
		'want',
		'wanted',
		'wanting',
		'wants',
		'was',
		'way',
		'ways',
		'we',
		'well',
		'wells',
		'went',
		'were',
		'what',
		'when',
		'where',
		'whether',
		'which',
		'while',
		'who',
		'whole',
		'whose',
		'why',
		'will',
		'with',
		'within',
		'without',
		'work',
		'worked',
		'working',
		'works',
		'would',
		'x',
		'y',
		'year',
		'years',
		'yet',
		'you',
		'young',
		'younger',
		'youngest',
		'your',
		'yours',
		'z',
		'alyssa',
		'pm',
		'am',
		'january',
		'february',
		'march',
		'arpil',
		'may',
		'june',
		'july',
		'august',
		'september',
		'october',
		'november',
		'december',
		'2011',
		'2010',
		'2012',
		'2012)',
'2011)',
'2011-12',
'2013',
'1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31',
'html>',
'lang="en">',
' ',
'charset="utf-8"',
'/>',
'class="lang-javascript">',
'undefined',
'/code',
'}',
'{',
'=',
'};',
'});'
);

// Split out all the individual words in the phrase
words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/gi)

// Review all the words
for(x=0; x < words.length; x++) {
// For each word, check all the stop words
for(y=0; y < stop_words.length; y++) {
// Get the current word
word = words[x].replace(/\s+|[^a-z]+/ig, "");	// Trim the word and remove non-alpha

// Get the stop word
stop_word = stop_words[y];

// If the word matches the stop word, remove it from the keywords
if(word.toLowerCase() == stop_word) {
// Build the regex
regex_str = "^\\s*"+stop_word+"\\s*$";		// Only word
regex_str += "|^\\s*"+stop_word+"\\s+";		// First word
regex_str += "|\\s+"+stop_word+"\\s*$";		// Last word
regex_str += "|\\s+"+stop_word+"\\s+";		// Word somewhere in the middle
regex = new RegExp(regex_str, "ig");

// Remove the word from the keywords
cleansed_string = cleansed_string.replace(regex, " ");
}
}
}
return cleansed_string.replace(/^\s+|\s+$/g, "");
}

String.prototype.count = function(search) {
	var m = this.match(new RegExp(search.toString().replace(/(?=[.\\+*?[^\]$(){}\|])/g, "\\"), "g"));
	return m ? m.length:0;
}

exports.return_summary = function(word,documents_in,title,fn)
{
	var documents = [];

	if(typeof documents_in === 'undefined')
	{
		console.log('Please pass a document in.');
		return;
	}
	else
	{
		documents = documents_in;
	}
	var word_count = [];
	var my_word = '';
	if(typeof word === 'undefined')
	{
		console.log('Please pass a word in.');
	}
	else
	{
		my_word = word;
	}

	var top_sentence = {'word':'','score':0};
	var top_sentence2 = {'word':'','score':0};
	var top_sentence3 = {'word':'','score':0};

	for(var j = 0;j<documents.length;j++)
	{
		var temp_document = documents[j];
		var doc_sentences = temp_document;

		for(var i = 0;i<doc_sentences.length;i++)
		{
			var temp_sentence = doc_sentences[i].message;
			if(temp_sentence.toLowerCase().indexOf(my_word.toLowerCase()) !== -1 && my_word !== '' && typeof my_word !== 'undefined')
			{
				var sentence_cleansed = temp_sentence.removeStopWords();
				var sentence_words = sentence_cleansed.split(' ');
				for(var k=0;k<sentence_words.length;k++)
				{
					if(typeof word_count[sentence_words[k]] === 'undefined' && sentence_words[k] !== 'undefined')
					{
						word_count[sentence_words[k]] = 1;
					}
					else
					{
						word_count[sentence_words[k]]++;
					}
				}
			}

		}
	}

	var top_words = [];
	var top_word_num = 10;
	for(var i = 0;i<top_word_num;i++)
	{
		top_words[i] = {'word':'','num':0};
	}

	var total_top_score = 0;

	for(key in word_count)
	{
		key = unescape(key);
		console.log(key);
		for(var i = 0;i<top_word_num;i++)
		{
			if(word_count[key] > top_words[i]['num'] && key !== my_word &&
				key !=='(Auster'&&
					key !=='(Wooldridge'&&
						key !=='(TRUCE'&&
							key !=='Shapka'&&
							key !=='&'&&
							key !=='2011-12'&&
							key !=='children\\u2019s' &&
							key !=='html>\n' &&
							key !=='lang="en">\n' &&
							key !=='\n'&&
							key !=='\r'&&
							key !=='charset="utf-8"'&&
							key !=='/>\n'&&
							key !=='class="lang-javascript">\n'&&
							key !==''&&
							key !==' ')
			{
				top_words[i]['word'] = key;
				top_words[i]['num'] = word_count[key];
				total_top_score += word_count[key];
				break;
			}
		}
	}

	for(var j = 0;j<documents.length;j++)
	{
		var temp_document = documents[j];
		var doc_sentences = temp_document;

		for(var i = 0;i<doc_sentences.length;i++)
		{
			var sent_score = 0;
			var sentence_arr_length = doc_sentences[i].message.split(' ').length;
			for(word_obj in top_words)
			{
				if(doc_sentences[i].message.indexOf(top_words[word_obj]['word']) !== -1)
				{
//Signifigance of word compared to ther top words * signifigance of word within sentence
if(title.indexOf(top_words[word_obj]['word']) !== -1){
	sent_score += (top_words[word_obj]['num']/total_top_score)*(1/sentence_arr_length)*100*2;
}
else{
	sent_score += (top_words[word_obj]['num']/total_top_score)*(1/sentence_arr_length)*100;
}
}
}
if(sent_score > top_sentence['score'] && doc_sentences[i].message.toLowerCase().indexOf(my_word) !== -1)
{
	top_sentence['word'] = htmlEntities(doc_sentences[i].message);
	top_sentence['score'] = sent_score;
	top_sentence['uname'] = doc_sentences[i].uname;
	top_sentence['ts'] = doc_sentences[i].ts;
}
else if(sent_score > top_sentence2['score'] && doc_sentences[i].message.toLowerCase().indexOf(my_word) !== -1 && top_sentence['word'] !== doc_sentences[i])
{
	top_sentence2['word'] = htmlEntities(doc_sentences[i].message);
	top_sentence2['score'] = sent_score;	
	top_sentence2['uname'] = doc_sentences[i].uname;
	top_sentence2['ts'] = doc_sentences[i].ts;
}
else if(sent_score > top_sentence3['score'] && doc_sentences[i].message.toLowerCase().indexOf(my_word) !== -1 && top_sentence2['word'] !== doc_sentences[i] && top_sentence['word'] !== doc_sentences[i])
{
	top_sentence3['word'] = htmlEntities(doc_sentences[i].message);
	top_sentence3['score'] = sent_score;	
	top_sentence3['uname'] = doc_sentences[i].uname;
	top_sentence3['ts'] = doc_sentences[i].ts;
}
}
}

var sentence_array = [top_sentence,top_sentence2, top_sentence3];
var return_string = '';
asyncLoop(sentence_array.length,function(loop){
	if(sentence_array[loop.iteration()].word.indexOf('/code ') !== -1)
	{
		var code_txt = sentence_array[loop.iteration()]['word'];
		markx({
input: '```javascript\n'+code_txt+'```', //can be either a filepath or a source string
template: '../markx/layout_summary.html', //can either be filepath or source string
highlight: true, //parse code snippets for syntax highlighters, default: true
data: {} //data that gets passed into template
}, function(err, html) {
	sentence_array[loop.iteration()].rich = html.replace('/code ', '');
	sentence_array[loop.iteration()].word = sentence_array[loop.iteration()].word.replace('/code ','');
	loop.next();
}
);
	}
	else
	{
		loop.next();
	}
},
function(){
	fn(JSON.stringify({
		'sentences':sentence_array,
		'top_words':top_words
	}));
});
}

var markx = require('markx');


function asyncLoop(iterations, func, callback) {
	var index = 0;
	var done = false;
	var loop = {
		next: function() {
			if (done) {
				return;
			}

			if (index < iterations) {
				index++;
				func(loop);

			} else {
				done = true;
				callback();
			}
		},

		iteration: function() {
			return index - 1;
		},

		break: function() {
			done = true;
			callback();
		}
	};
	loop.next();
	return loop;
}

function htmlEntities(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}