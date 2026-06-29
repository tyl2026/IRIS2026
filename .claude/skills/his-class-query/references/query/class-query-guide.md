---
source: "pdf"
source_file: "D:/dhcc_code/query/示例/提取自GOBJ.pdf"
created: "2026-05-13T09:31:45Z"
pages: 11
---


# 28


## Defining and Using Class Queries

This page describes how to define and use class queries, which are a form of dynamic SQL to be used via the %SQL classes.

### 28.1 Introduction to Class Queries

A class query is a tool —contained in a class and meant for use with dynamic SQL  to look up records that meet specified criteria. W ith class queries, you can create predefined lookups for your application. F or example, you can look up records by name, or provide a list of records that meet a particular set of conditions, such as all the flights from P aris to Madrid. By creating a class query, you can avoid having to look up a particular object by its internal ID. Instead, you can create a query that looks up records based on any class properties that you want. These can even be specified from user input at runtime. If you define a custom class query , your lookup logic can use ObjectScript and can be arbitrarily complex. There are two kinds of class queries: • Basic class queries, which use the class %SQLQuer y and an SQL SELECT statement. • Custom class queries, which use the class %Quer y and custom logic to execute, fetch, and close the query. These are discussed on another page. Note that you can define class queries within any class; there is no requirement to contain them within persistent classes. Important: Y ou can define a class query that depends upon the results of another class query, but the RO WSPEC parameter must be specified in the queries.

### 28.2 Using Class Queries

Before looking at how to define class queries, it is useful to see how you can use them. In serverside code, you can use a class query as follows: 1. Use %New() to create an instance of %SQL. Statement . 2. Call the %Pr epareClassQuery() method of that instance. As arguments, use the following, in order: a. Fully qualified name of the class that defines the query that you w ant to use. b. Name of the query in that class. Defining and Using Classes 193 <!-- page break -->
Defining and Using Class Queries This method returns a %Status value, which you should check. 3. Call the %Execute() method of the %SQL. Statement instance. The %Execute() accepts any parameters needed by the query. Specify these in the order required by the query. This returns an instance of %SQL. StatementResult . 4. Use methods of %SQL. StatementResult to retrieve data from the result set. For details, see Dynamic SQL . Suppose that Sample . Person has a query named ByName , which in turn accepts a string value; this query returns a result set containing people whose names include the input string. The following shows a simple example that uses the ByName query of Sample . Person; error checking is not shown: ObjectScript   set statement = ##class(%SQL. Statement).%New()  set status = statement.%PrepareClassQuery("Sample. Person","ByName")  set rset = statement.%Execute("Jo") //Look for names containing Jo  while rset.%Next() {  write !, rset.%Get("Name")  } Y ou can also invoke the query as a stored procedure, thus executing it from an SQL context. See Defining and Using Stored Procedures.

# 28.3 Defining Basic Class Queries

To define a basic class query, define a query as follows: • (For simple class queries) The type should be %SQLQuer y. • Optionally specify parameters of %SQLQuer y, such as RO WSPEC . The RO WSPEC parameter for a query provides information on the names, data types, headings, and order of the fields in each ro w . For more information, see Parameters of the Class Query. • In the argument list, specify any arguments that the query should accept. • In the body of the definition, write an SQL SELECT statement. In this statement, to refer to an argument, precede the argument name with a colon (: ). This SELECT statement should not include an INT O clause. • Include the SqlProc keyw ord in the query definition. This causes the class query to be projected as a stored procedure, so that it can be visible via the INFORMA TION\_SCHEMA. Routines and INFORMA TION\_SCHEMA. P arameters tables. • Optionally specify the SqlName keyw ord in the query definition, if you w ant the name of the stored procedure to be other than the default name. These are compiler keyw ords, so include them in square brackets after any parameters, after the query type (%SQLQuer y).

# 28.4 Parameter s of the Class Query

This section provides more details on the parameters you specify within a custom class query. 194 Defining and Using Classes <!-- page break -->
Example

## 28.4.1 About RO WSPEC

The RO WSPEC parameter for a query provides information on the names, data types, headings, and order of the fields in each row . It is a quoted and commaseparated list of variable names and data types of the form: ROWSPEC = "Var1:%Type1, Var2:%Type2\[: OptionalDescription\], Var3" The RO WSPEC specifies the order of elds as a commaseparated list. The information for each field consists of a colonseparated list of its name, its data type (if it is different than the data type of the corresponding property), and an optional heading. The number of elements in the RO WSPEC parameter must match the number of fields in the query . Otherwise, InterSystems IRIS® data platform returns a Cardinality Mismatch error. For an example, the ByName query of the Sample . Person class is as follows: Class Member Query ByName(name As %String = "")  As %SQLQuery(CONTAINID = 1, ROWSPEC = "ID:%Integer, Name, DOB, SSN", SELECTMODE = "RUNTIME")  \[ SqlName = SP\_Sample\_By\_Name, SqlProc \] {  SELECT ID, Name, DOB, SSN  FROM Sample. Person  WHERE (Name %STARTSWITH : name)  ORDER BY Name } Here, the CONT AINID parameter specifies that the ro w ID is the first eld (the def ault); note that the first eld specied in the SELECT statement is ID. The RO WSPEC parameter specifies that the elds are ID (treated as an integer), Name , DOB , and SSN ; similarly, the SELECT statement contains the fields ID, Name , DOB , and SSN , in that order.

## 28.4.2 About CONT AINID

CONT AINID should be set to the number of the column returning the ID (1, by default) or to 0 if no column returns the ID. Note: The system does not validate the value of CONT AINID . If you specify a nonvalid value for this parameter, there is no error message. This means that if your query processing logic depends on this information, you may experience inconsistencies if the CONT AINID parameter is set improperly.

## 28.4.3 Other Parameter s of the Query Class

In addition to RO WSPEC and CONT AINID , you can specify the following parameters of the query. These are class parameters for %SQLQuer y: • SELECTMODE • COMPILEMODE For details, see the class reference for %Library. SQLQuer y and %Library. Query (its superclass).

# 28.5 Example

The following shows a simple example: Defining and Using Classes 195 <!-- page break -->
Defining and Using Class Queries

## Class Member

Query ListEmployees(City As %String = "")  As %SQLQuery (ROWSPEC="ID:%Integer, Name:%String, Title:%String", CONTAINID = 1) \[SqlProc,  SqlName=MyProcedureName\] { SELECT ID, Name, Title FROM Employe WHERE (Home\_City %STARTSWITH : City)  ORDER BY Name }

# 28.6 Maxim um Length of String Parameter s

| If you call a class query using | ADO. NET , ODBC, or JDBC, an | y string parameters will be truncated to 50 characters by |
| --- | --- | --- |
| def | ault. T o increase the maximum string length for a parameter | , specify a MAXLEN in the signature, as in the follo wing |
| e xample: |  |  |
| Query MyQuery(MyParam As %String(MAXLEN = 20) As %SQLQuery [SqlProc] |  |  |
| This truncation does not occur if you call the query from the Management Portal or from ObjectScript. |  |  |
| 28.7 See Also |  |  |
| • | De fi ning Custom Class Queries |  |
| • | De fi ning Classes |  |
| 196 |  | Defining and Using Classes |
<!-- page break -->

# 29


## Defining Custom Class Queries

Class queries are a form of dynamic SQL to be used via the %SQL classes. Basic class queries perform all result set management for you, but in some cases, you may need custom code. This page describes how to define custom class queries, which are defined by a set of methods that w ork together. Note: Custom class queries are not supported for sharded classes.

### 29.1 Defining Custom Class Queries

To define a custom query , use the instructions for defining basic class queries, with the following changes: • Specify %Quer y for the query type. • Specify the RO WSPEC parameter of the query (in parentheses, after the query type). This parameter provides information on the names, data types, headings, and order of the fields in each ro w of the result set of the query. See About R O WSPEC . • Optionally specify the CONT AINID parameter of the query (in parentheses, after the query type). This parameter specifies the column number of the eld, if an y, that contains the ID for a particular row; the default is 1. See About CONT AINID . Together, the RO WSPEC and CONT AINID parameters are known as the query specification . • Leave the body of the query definition empty . For example: Class Member Query All() As %Query(CONTAINID = 1, ROWSPEC = "Title:%String, Author:%String") { } • Define the follo wing class methods in the same class: – querynameExecute—This method must perform any onetime setup. – querynameF etch—This method must return a row of the result set; each subsequent call returns the next row . – querynameClose—This method must perform any cleanup operations. Where queryname is the name of the query. Each of these methods accepts an argument (qHandle), which is passed by reference. Y ou can use this argument to pass information among these methods. Defining and Using Classes 197 <!-- page break -->
| Defining Custom Class Quer | ies |
| --- | --- |
|  | These methods de fi ne the query . The ne xt section pro vides details. |
|  | These methods by def ault are written in ObjectScript. |
| 29.2 Defining the Methods |  |
| F or basic demonstration purposes, this section sho | ws a simple e xample that could also be implemented as a basic class |
query. These methods implement the code for the following query: Class Member Query AllPersons() As %Query(ROWSPEC = "ID:%String, Name:%String, DOB:%String, SSN:%String") { } The next section shows a more complex example. Also see Uses of Custom Queries, for information on other use cases.

# 29.2.1 Defining the querynameEx ecute() Method

The querynameExecute() method must provide all the setup logic needed. The name of the method must be querynameExecute, where queryname is the name of the query. This method must have the following signature: ClassMethod queryNameExecute(ByRef qHandle As %Binary,  additional\_arguments) As %Status Where: • qHandle is used to communicate with the other methods that implement this query. This method should set qHandle as needed by the querynameF etch method. Although qHandle is formally of type %Binar y, it can hold any value, including an OREF or a multidimensional array. • additional\_arguments is any runtime parameters that the query can use. W ithin this implementation of method, use the following general logic: 1. Perform any onetime setup steps. For queries using SQL code, this method typically includes declaring and opening a cursor. 2. Set qHandle as needed by the querynameF etch method. 3. Return a status value. The following shows a simple example, the AllPersonsExecute() method for the AllPersons query introduced earlier: Class Member ClassMethod AllPersonsExecute(ByRef qHandle As %Binary) As %Status {  set statement=##class(%SQL. Statement).%New()  set status=statement.%PrepareClassQuery("Sample. Person","ByName")  if $$$ISERR(status) { quit status }  set resultset=statement.%Execute()  set qHandle=resultset  Quit $$$OK } 198 Defining and Using Classes <!-- page break -->
Defining the Methods In this scenario, the method sets qHandle equal to an OREF, specifically an instance of %SQL. StatementResult , which is the value returned by the %Execute() method. As noted earlier, this class query could also be implemented as a basic class query rather than a custom class query. Some custom class queries do, howe ver, use dynamic SQL as a starting point.

# 29.2.2 Defining the querynameFetc h() Method

The querynameF etch() method must return a single row of data in $List format. The name of the method must be querynameF etch, where queryname is the name of the query. This method must have the following signature: ClassMethod queryNameFetch(ByRef qHandle As %Binary,  ByRef Row As %List,  ByRef AtEnd As %Integer = 0) As %Status \[ PlaceAfter = querynameExecute \] Where: • qHandle is used to communicate with the other methods that implement this query. When InterSystems IRIS® data platform starts executing this method, qHandle has the value established by the querynameExecute method or by the previous invocation (if any) of this method. This method should set qHandle as needed by subsequent logic. Although qHandle is formally of type %Binar y, it can hold any value, including an OREF or a multidimensional array. • Row must be either a %List of values representing a row of data being returned or a null string if no data is returned. • AtEnd must be 1 when the last row of data has been reached. • The PlaceAfter method keyw ord controls the position of this method in the generated routine code. For querynameExecute, substitute the name of the specific querynameExecute() method. Be sure to include this if your query uses SQL cursors. (The ability to control this order is an advanced feature that should be used with caution. InterSystems does not recommend general use of this keyw ord.) W ithin this implementation of method, use the following general logic: 1. Check to determine if it should return any more results. 2. If appropriate, retrieve a row of data and create a %List object and place that in the Row variable. 3. Set qHandle as needed by subsequent invocations (if any) of this method or needed by the querynameClose() method. 4. If no more rows exist, set Row to a null string and set AtEnd to 1. 5. Return a status value. For the AllPersons example, the AllPersonsFetch() method could be as follows: Defining and Using Classes 199 <!-- page break -->
Defining Custom Class Queries Class Member ClassMethod AllPersonsFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0)  As %Status  \[ PlaceAfter = AllPersonsExecute \] {  set rset = $get(qHandle)  if rset = "" quit $$$OK  if rset.%Next() {  set Row=$lb(rset.%GetData(1),rset.%GetData(2),rset.%GetData(3),rset.%GetData(4) set AtEnd=0  } else {  if (rset.%SQLCODE < 0) {write "%Next failed:", !, "SQLCODE ", rset.%SQLCODE, ": ", rset.%Message  quit}  set Row=" set AtEnd=1  }  quit $$$OK } Notice that this method uses the qHandle argument, which provides a %SQL. StatementResult object. The method then uses methods of that class to retrieve data. The method builds a $List and places that in the Row variable, which is returned as a single row of data. Also notice that the method contains logic to set the AtEnd variable when no more data can be retrieved. As noted earlier, this class query could also be implemented as a basic class query rather than a custom class query. The purpose of this example is to demonstrate setting the Row and AtEnd variables.

# 29.2.3 The quer ynameClose() Method

The querynameClose() method must perform any needed clean up, after data retrieval has finished. The name of the method must be querynameClose, where queryname is the name of the query. This method must have the following signature: ClassMethod queryNameClose(ByRef qHandle As %Binary) As %Status \[ PlaceAfter = querynameFetch \] Where: • qHandle is used to communicate with the other methods that implement this query. When InterSystems IRIS starts executing this method, qHandle has the value established by the last invocation of the querynameF etch method. • The PlaceAfter method keyw ord controls the position of this method in the generated routine code. For querynameFetch, substitute the name of the specific querynameF etch() method. Be sure to include this if your query uses SQL cursors. (The ability to control this order is an advanced feature that should be used with caution. InterSystems does not recommend general use of this keyw ord.) W ithin this implementation of method, remove variables from memory, close any SQL cursors, or perform any other cleanup as needed. The method must return a status value. For the AllPersons example, the AllPersonsClose() method could be as follows: For example, the signature of a ByNameClose() method might be: Class Member ClassMethod AllPersonsClose(ByRef qHandle As %Binary) As %Status \[ PlaceAfter = AllPersonsFetch \] {  Set qHandle=" Quit $$$OK } 200 Defining and Using Classes <!-- page break -->
Defining Parameters for Custom Quer ies

## 29.2.4 Generated Methods for Custom Queries

The system automatically generates the querynameGetInf o() and querynameF etchRows(). Y our application does not call any of these methods directly.

# 29.3 Defining Parameter s for Custom Queries

If the custom query should accept parameters, do the following: • Include them in the argument list of the query class member. The following example uses a parameter named MyParam :
|  | Class Member |
| --- | --- |
|  | Query All(MyParam As %String) As %Query(CONTAINID = 1, ROWSPEC = "Title:%String, Author:%String") |
|  | { |
|  | } |
| • | Include the same parameters in the ar gument list for queryname Execute method, in the same order as in the query |
|  | class member . |
| • | In the implementation of the queryname Execute method, use the parameters as appropriate for your needs. |
Note: If you call a class query using ADO. NET , ODBC, or JDBC, any string parameters will be truncated to 50 characters by default. To increase the maximum string length for a parameter, specify a MAXLEN in the signature, as in the following example: Query MyQuery(MyParam As %String(MAXLEN = 20) As %Query \[SqlProc\] This truncation does not occur if you call the query from the Management Portal or from ObjectScript.

# 29.4 When to Use Custom Queries

The following list suggests some scenarios when custom queries are appropriate: • If it is necessary to use very complex logic to determine whether to include a specific ro w in the returned data. The querynameF etch() method can contain arbitrarily complex logic. • If you have an API that returns data in format that is inconvenient for your current use case. In such a scenario, you w ould define the querynameF etch() method so that converts data from that format into a $List, as needed by the Row variable. • If the data is stored in a global that does not have a class interface. • If access to the data requires role escalation. In this scenario, you can perform the role escalation within the querynameExecute() method. • If access to the data requires calling out to the file system (for e xample, when building a list of files). In this scenario, you can perform the callout within the querynameExecute() method and then stash the results either in qHandle or in a global. • If it is necessary to perform a security check, check connections, or perform some other special setup work before retrieving data. Y ou would do such work within the querynameExecute() method. Defining and Using Classes 201 <!-- page break -->
| Defining Custom Class Quer | ies |  |
| --- | --- | --- |
| 29.5 SQL Cur | sor | s and Class Queries |
| If a class query uses an SQL cursor |  | , note the follo wing points: |
• Cursors generated from queries of type %SQLQuer y automatically have names such as Q14. Y ou must ensure that your cursors are given distinct names. • Error messages refer to the internal cursor name, which typically has an extra digit. Therefore an error message for cursor Q140 probably refers to Q14. • The class compiler must find a cursor declaration before making an y attempt to use the cursor. This means that you must take extra care when defining a custom query that uses cursors. The DECLARE statement (usually in querynameExecute() method) must be in the same MAC routine as the Close and Fetch and must come before either of them. As shown earlier in this topic, use the method keyw ord PlaceAfter in both the querynameF etch() and querynameClose() method definitions to mak e sure this happens.

# 29.6 See Also

• Defining and Using Class Queries • Defining Classes 202 Defining and Using Classes <!-- page break -->
| 30 |  |  |
| --- | --- | --- |
| Defining and Using XData Bloc |  | ks |
| An | XData bloc | k is a class member that consists of a name and a unit of data that you include in a class de fi nition for use |
| by the class after compilation. |  |  |
| 30.1 Basics |  |  |
| An | XData bloc | k is a named unit of data that you include in a class de fi nition, typically for use by a method in the class. |
Most frequently, it is a wellformed XML document, but it could consist of other forms of data, such as JSON or Y AML. Y ou can create an XData block by typing it directly in your Integrated Development Environment (IDE). An XData block is a named class member (like properties, methods, and so on). The available XData block keyw ords include: • SchemaSpec —Optionally specifies an XML schema ag ainst which the XData can be validated. • XMLNamespace —Optionally specifies the XML namespace to which the XData block belongs. Y ou can also, of course, include namespace declarations within the XData block itself. • MimeT ype—The MIME type (more formally, the Internet media type) of the contents of the XData block. The default is text/xml . If used to store XML, the XData block must consist of one root XML element, with any valid contents.

# 30.2 XML Example

To access an XML document in an arbitrary XData block programmatically, you use %Dictionary. CompiledXData and other classes in the %Dictionary package. An XData block is useful if you want to define a small amount of system data. F or example, suppose that the EPI. AllergySeverity class includes the properties Code (for internal use) and Description (for display to the users). This class could include an XData block like the following: Defining and Using Classes 203
