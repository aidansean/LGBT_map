var EU_member_nations = new nation_list(loadXMLDoc('xml/EU.xml'             ).childNodes[0]) ;
var ssm_nations       = new nation_list(loadXMLDoc('xml/sameSexMarriage.xml').childNodes[0]) ;
var test_nations      = new nation_list(loadXMLDoc('xml/test.xml'           ).childNodes[0]) ;

//var current_nations = EU_member_nations ;
//var current_nations = test_nations ;
var current_nations = ssm_nations ;

