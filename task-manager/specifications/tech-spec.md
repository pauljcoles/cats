Shape 

 

Shock.jpg 

 

 

Software Engineering  

Software Requirements Specification 

(SRS) Document 

 

Ryan Evans 

Barry Chapman 

Sam Williams 

Devin Coger 
SoftEng06 
www.radford.edu/~softeng06 
10/20/2009 

Shape 

 

Revisions 

 

 

Version 

Primary Author(s) 

Description of Version 

Date Completed 

Final Draft 

Team 

All sections being Filled 

 

10/20/09 

 

 

Review & Approval 

Requirements Document Approval History 

Approving Party 

Version Approved 

Signature 

Date 

Barry Chapman 

 

 

 

Dr. T. L. Lewis 

 

 

 

 

Requirements Document Review History 

Reviewer 

Version Reviewed 

Signature 

Date 

Ryan Evans 

 

 

 

Sam Williams 

 

 

 

Devin Coger 

 

 

 

 

 

Contents 

 

 

 

1. Introduction 

Introduction 

The purpose of this document is to define and describe the requirements of the project and to spell out the system’s functionality and its constraints. 

 

Scope of this Document 

The customer and the user for the system are the employees of the IDANRV, including Mrs. Sheila Roop, and the developers of the system is the Shock Force Software Team. Our constraints for this section includes our deadline for the document which is due 10/29/09 

 

Overview 

The product is an Access Database with import/export capabilities from Excel that will hold information on auctions, bid items and their bidders, including auction income, auction expenses, bid amount, bid increment, bid ID, item donor, item’s original value, payment type, bidder name, and bidder email.  

 

Business Context 

As it applies to this project, The Intellectual Disabilities Agency of the New River Valley is a non-profit organization that supports people struggling with intellectual disabilities through holding fundraisers and silent auctions to raise aid as well as awareness 

 

2. General Description 

2.1 Product Functions 

The product should make input of data and the entire checkout process easier and streamlined for the users (employees) and time efficient for the bidder.  

 

2.2 Similar System Information 

The product is being developed with Access, so there are a large number of similar databases or systems and they are used for a wide array of different purposes. The possible strength our system has over the majority is the Excel import/export feature of the program. 

 

2.3 User Characteristics 

The users include the employees of the IDA as they input data on bids and their bidders. For this system, the user is required to know the basic usability of Excel as well as a very base level understanding of access, which hopefully will be facilitated by the software team through training. 

 

2.4 User Problem Statement 

The users system, currently, is slow and inefficient as it relates to the checkout process. Bidders must wait hours to check out the item they have won. Too many man hours have been needed to enter the wealth of information collected. 

 

2.5 User Objectives 

The user wants a database that will store information on a silent auction. The program must faciliatate the speed and ease of input. It also must store the items the IDANRV needs to store. 

 

 

2.6 General Constraints 

Constraints include an easy to use interface for the program through forms, a Windows platform or, at bare minimum, a Mac with Access and Excel for Mac installed. Also, it must be constructed in Access, Excel, or another related program that is easily learnable. 

3. Functional Requirements 

Items provided to the IDANRV shall be stored in the Access Database. 

Items shall be stored on the laptop machine and have complete fields. 

Very high criticality 

Limited network / wi-fi availability could present a technical challenge 

The above stated factor is a risk we have encountered. Eliminate it by reducing the dependency of our program on these things.  

This requirement is the basis of the project; all other aspects depend on it.  
 

The items shall be accessible via queries and reports. 

Users of the database should be able to run reports on the data that has been put into the database. They should also be able to run queries. 

Very high criticality 

We do not foresee any technical issues preventing the implementation of this.  

Given the capabilities of Access, this requirement is able to be satisfied.  

This requirement depends on requirement number one. 

The data stored should be able to be manipulated through forms. 

Items and other data should be able to be added and updated through the use of forms. 

Very high criticality 

We do not foresee any technical risks involved in this requirement. 

The only factor we can encounter here is the user of the system not being able to use it correctly. We will overcome this by training those who will be using it.  

This requirement is dependent on requirement one. 

 

 

 

4. Interface Requirements 

4.1 User Interfaces 
 

4.1.1 GUI 
The user interface for this program is the interface provided by Microsoft Access 2007. Access includes forms and reports for the users to query and organize data to suit their needs. Forms and reports both have builders that let the user specify which fields they want to use and which constraints they want to define.  

4.1.2 CLI 
There is no command line interface 

4.1.3 API 
There is no API for the product  

4.1.4 Diagnostics or ROM 
There is a troubleshooting and help section provided by Microsoft  

4.2 Hardware Interfaces 

The program (Access) uses the hard disk. Access to the hard drive and other hardware is managed by the operating system and Access.  

4.3 Communications Interfaces 

If we decide to implement an Ad Hoc network for a shared database, the operating system will handle those connections.  

4.4 Software Interfaces 

The Access system may be used to import and export data with Microsoft Excel. This functionality is built in to the user interface.  

5. Performance Requirements 

The database is designed to be operated through Microsoft Access 2007, thus no additional system requirements exist beyond those required to run Microsoft Office 2007, except for a negligible amount of hard drive space to store the database.  

 

Microsoft lists the requirements for Access 2007 as follows: 

500 MHz processor or higher 

256MB RAM or higher 

1.5GB Available Hard Drive Space 

Windows XP SP2 or later operating system. 

Windows Office Professional 2007 (Windows Access) 

There is also Access Available for Mac OS X, the clients have not stated a need thus far. 

 

 

 

 

 

 

6. Other non-functional attributes 

.  

6.1 Security 

 

The system shall be designed with a level of security appropriate for the sensitivity of information enclosed in the database. More interaction is needed with client about the volatility of the information. Since there is no obvious information that is of a  high security level such as credit card information, the only requirements that could be implemented are encrypting the database and/or making the database password-protected, by user’s request. 

6.2 Binary Compatibility 

 

This system will be compatible with any computer that has Microsoft Office Professional 2007 or later installed (whether PC or Mac), and will be designed with more than one computer in mind. 

6.3 Reliability 

 

Reliability is one of the key attributes of the system. Back-ups will be made regularly so that restoration with minimal data loss is possible in the event of unforeseen events. The system will also be thoroughly tested by all team members to ensure reliability. 

6.4 Maintainability 

 

The system shall be maintained by Sheila Roop, of the IDA, or delegated to another employee. 

 

6.5 Portability 

 

The system shall be designed in a way that shall allow it to be run on multiple computers with Microsoft Office Professional 2007 or later installed. 

6.6 Extensibility 

The system shall be designed and documented in such a way that anybody with an understanding of Microsoft Access shall be able to extend the system to fit their needs with the team’s basic instructions. 

6.7 Reusability 

 

The system should be designed in a way that allows the database to be re-used regularly for the various silent auctions that the organization shall hold. 

 

6.8 Application Affinity/Compatibility 

 

This system requires the Microsoft Office Professional 2007 suite or later, as it operates primarily through Microsoft Access, in conjunction with Microsoft Excel. 

 

6.9 Resource Utilization 

 

The resources used in the creation of this system include: Dr. Lewis, the client (Sheila Roop), the computers in Davis Hall, and the internet. 

6.10 Serviceability 

 

The maintenance of the system should be able to be sufficiently performed by any person with a basic understanding of Microsoft Access. 

7. Operational Scenarios 

Scenario A: Initial Item Definitions 

The user shall enter the information about the items into the database for its initial construction and evolution. The fields will be completed via a form that will manipulate the data.  

 

Scenario B: Customer Check-out 

The user shall be able to enter information about the customer purchasing a particular item, and record their bid and other information. They will also enter the winning bid 

 

Scenario C: Database Maintenance 

The user may want to alter/delete information after the auction is over, In this case they will need to be able to remove the data that has been entered. 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

8. Preliminary Use Case Models and Sequence Diagrams 

This section presents a list of the fundamental sequence diagrams and use cases that satisfy the system’s requirements. The purpose is to provide an alternative, "structural" view of the requirements stated above and how they might be satisfied in the system.  

8.1 Use Case Model 

 

 

 

 

 

 

 

 

 

 

8.2 Sequence DiagramsEnter Winning Bid.jpgDefine Items.jpg 

 
 

 

9. Updated Schedule 

The updated PERT/GANTT chart is attached at the end of the document 

10. Updated Budget 

An updated budget is attached at the end of this document 

11. Appendices 

11.1 Definitions, Acronyms, Abbreviations 
IDANRV- Intellectual Disabilities Agency of the New River Valley  