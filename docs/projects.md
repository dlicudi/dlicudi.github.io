---
title: Projects
summary: A sample of interesting projects I've worked on
author: Duane Licudi
---

# Projects

A sample of interesting projects I've worked on, some of which I have expanded on to include sequence diagrams as a visual aid. 

## EPG CDR Processor
L|Python|https://www.python.org|
L|MongoDB|https://www.mongodb.com|
L|Multiprocessing|https://docs.python.org/3/library/multiprocessing.html|
L|Systemd|https://systemd.io|
L|ASN.1|https://www.ncbi.nlm.nih.gov/Structure/asn1.html|
L|XML|https://www.w3.org/XML/|
L|YAML|https://yaml.org|

Developed a Python application to efficiently process and analyse Call Detail Records (CDRs). The tool parses XML-converted CDRs, extracting data points such as MSISDN, IMSI, network type, and traffic volumes, then stores these records in MongoDB for data retrieval and analysis.

``` mermaid
sequenceDiagram
    participant EPG as Packet Gateway
    participant Mediation as Mediation Platform
    participant Files as CDR File Storage
    participant Decoder as CDR Decoder
    participant Processor as CDR Processor
    participant MongoDB as MongoDB
    EPG->>Mediation: SFTP Transfer to mediation
    Mediation->>Files: SFTP Transfer to file storage
    Files->>Decoder: ASN.1 to XML decoding
    Decoder->>Processor: Parsing decoded CDRs 
    Processor->>MongoDB: Database storage 
```

- Custom parsing of hexadecimal data for accurate location and timestamp information.
- Multi-processing to handle large datasets concurrently (using python multiprocessing module).
- Automated file management to prevent duplicate processing.
- Error logging and handling for operational reliability.

---

## OLM Processor
L|Python|https://www.python.org|
L|MongoDB|https://www.mongodb.com|
L|Multiprocessing|https://docs.python.org/3/library/multiprocessing.html|
L|Systemd|https://systemd.io|
L|YAML|https://yaml.org|


Designed and implemented a Python-based system for processing Online Mediation platform data, managing the collection and decoding of logs from various network streams.

``` mermaid
sequenceDiagram
    participant OLM as Online Mediation Platform
    participant OLM_Collector as OLM Collector
    participant OLM_Decoder as OLM Decoder
    participant OLM_Processor as OLM Processor
    participant MongoDB as MongoDB
    OLM->>OLM_Collector: SFTP collection
    OLM_Collector->>OLM_Decoder: Decoding
    OLM_Decoder->>OLM_Processor: Processing
    OLM_Processor->>MongoDB: Storage
```

- **Collector** utilises SFTP to fetch log files from multiple predefined streams, organizing and managing these files across local directories for processing.
- **Decoder** parses log filenames and content to extract timestamps, stream identifiers and MSISDN.
- **Processor**: Processes decoded files for storage in MongoDB.

---

## Field Ops Portal
L|Python|https://www.python.org|
L|Django|https://www.django.org|
L|Django OTP|https://github.com/django-otp/django-otp|
L|Django Two-Factor Authentication|https://pypi.org/project/django-two-factor-auth/|
L|Celery|https://www.celery.org|
L|Nginx|https://nginx.org|
L|LDAP|https://www.python-ldap.org/en/python-ldap-3.4.3/|
L|Rsyslog|https://www.rsyslog.com|

The main goal of this project was provide a facility that would allow providing customers with appointments in real time, without having to check back on availability, as this was provided in real time. This also included real time integration of CRM platform to retrieve and store relevant work order information.

The approach was to create actual empty time slots per engineer and have this allocated to appointments, this avoided any chance of double booking.

The system managed engineers, activities, time slots and appointments which were assigned to available time slots.

For appointment confirmation and reminders, **Celery** was used to schedule emails based on current date and appointment dates.

For internal use the Django Admin interface including significant modifications to show notes and time slot usage visually utilising **Chart.js**.


---

## FTTH Migration Portal
TODO brief description

---

## IMS Migration Portal
TODO brief description

---

## MVNO SIM Activator
L|Python|https://www.python.org|
L|XML SOAP|https://www.w3schools.com/xml/xml_soap.asp|
L|Systemd|https://systemd.io|

An automated system designed to manage and activate SIM cards by interfacing with a CRM (Customer Relationship Management) system. It monitors open activation events, processes relevant data, and executes necessary actions to complete activation workflows.

``` mermaid
sequenceDiagram
    participant CRM as CRM Platform
    participant Events as Events
    participant WorkOrders as Work Orders
    participant Jobs as Jobs

    CRM->>Events: Event detection (SOAP API)
    Events->>WorkOrders: Extract access number data for activation
    WorkOrders->>Jobs: Activate work order job step and close event
```

---

## MVNO Usage Database
L|Python|https://www.python.org|
L|MySQL|https://www.mysql.com|
L|XML SOAP|https://www.w3schools.com/xml/xml_soap.asp|
L|Multiprocessing|https://docs.python.org/3/library/multiprocessing.html|
L|YAML|https://yaml.org|

Developed a Python-based system for collecting, processing, and storing usage data of subscribers. Utilised MySQL for database management and interfaced with an SOAP API interface to fetch subscriber usage details.

``` mermaid
sequenceDiagram
    participant CRS as CDR Reporting System
    participant Collector as Collector
    participant MySQL as MySQL Database

    CRS->>Collector: Collect specific data range for subscriber
    Collector->>MySQL: Store parsed data as usage records
```

---

## Cockpitdecks
L|Python|https://www.python.org|
L|Loupedeck|https://www.loupedeck.com|
L|Streamdeck|https://www.elgato.com/ww/en|
L|X-Plane|https://x-plane.com|
L|Git|https://git-scm.com|
L|Github|https://github.com|
L|YAML|https://yaml.org|


Contributed to the development of **Cockpitdecks**, an open-source project providing a Python interface for controlling Loupedeck Live and other decks for integration with X-Plane flight simulation software.

- Diagnosed and resolved compatibility issues with [Loupedeck Live](https://github.com/devleaks/python-loupedeck-live/issues/2) on newer hardware firmware models.
- Contributed bug fixes and new features to [Cockpitdecks](https://github.com/devleaks/cockpitdecks/commits/main/?author=dlicudi) repository.
- Established a separate [repository](https://github.com/dlicudi/cockpitdecks-configs) and [documentation](https://dlicudi.github.io/cockpitdecks-configs/) to host a comprehensive set of aircraft configurations for use with CockpitDecks.

---

## SMS Gateway
L|Python|https://www.python.org|
L|YAML|https://yaml.org|
L|Django|https://www.django.org|
L|Nginx|https://nginx.org|

Developed a solution to provide an API that could interface an SMS Centre.
This comprised of a Portal (Django + PostgreSQL), a front end API (FastAPI) and background services (Python) that could interface directly with the SMS Centre using SMPP.

``` mermaid
sequenceDiagram
    participant Enduser as End Users
    Enduser->>FrontendAPI: RESTful API Client
    participant FrontendAPI as External REST API
    participant Django as Billing & Messaging Engine
    participant Services as Services
    participant SMSC as SMS Centre
    FrontendAPI->>Django: Send and receive messages
    Services->>Django: Incoming messages and delivery reports
    Services->>SMSC: Transmit messages
    Django->>Services: Outgoing messages
    SMSC->>Services: Incoming messages and delivery reports
```

Django Rest Framework, Admin Interface, Signals used to adjust increase client balances on top up decrease on creating message.

Django Models made use of foreign keys, extensive use of attributes such as on_delete, help_text, validators, db_index.

Models using of clean and save functions to check for credit and save allowed adding dynamic data such as number of SMS parts required for a message.

Heavily customised admin views.

Developed an SMSC telnet library required to interface with SMS centre to retrieve information such as status of the SMS centre, throughput and licensing limits.

Delivery reports were recieved via SMPP connection and sent to the Portal via Django's REST framework API.

Services to handle incoming and outgoing messages were handled via separate listener and transmitter services connected via SMPP.

---

## ETK (Provisioning Platform)
TODO expanded description


``` mermaid
sequenceDiagram
    participant A as Flask Front End & CLI Interface
    participant B as Packages (interface libraries)
    participant C as DB Storage (MongoDB)
    participant D as External Interfaces
    A->>B: Load custom Python modules
    B->>C: interface configuration
    B->>D: Telnet/SOAP/RESTFul
```

RQ Active/Standby provisioning
Provisioning of and presentation of Panic button data using SMS.

---

## Check_MK Monitoring System
TODO

---

## MVNO Number Porting
L|Python|https://www.python.org|
L|telnetlib|https://docs.python.org/3/library/telnetlib.html|
L|MongoDB|https://www.mongodb.com|
L|Systemd|https://systemd.io|
L|YAML|https://yaml.org|
L|MML (man–machine language)|https://en.wikipedia.org/wiki/MML_(programming_language)|
L|Multiprocessing|https://docs.python.org/3/library/multiprocessing.html|

Developed a Python-based **MVNO** number porting mediation service for a spanish MVNO to automate the provisioning of ported numbers.
This that utilises SFTP for file collection, **MongoDB** for data storage and parsing of CSV/gzip data files. It also required interfacing with a Flexible Number Registry via **Telnet** and **MML** to retrieve existing subscriber translations and activate new ones. Multiprocessing capability was introduced allowing multiple activators to run in parallel.


``` mermaid
sequenceDiagram
    participant AOPM as AOPM
    participant Collector as Collector
    participant FileStorage as File Storage
    participant Importer as Importer
    participant Database as Database (MongoDB)
    participant Processor as Processor
    participant Activator as Activator
    participant FNR as Flexible Number Registry

    AOPM->>Collector: SFTP transfer of files
    Collector->>FileStorage: Storage of collected files
    FileStorage->>Importer: Reading data from file storage
    Importer->>Database: Saving file data to database
    FileStorage->>Processor: Translation of file data to subscriber translations
    Processor->>Database: Storing subscriber translations for activation
    Activator->>Database: Retrieving subscriber translations
    Activator->>FNR: Activation of subscriber translations    
```

**Modular Design**: Employed a modular architecture (Collector, Importer, Processor, Activator); this allowed for easier maintenance, better scalability and improved reliability.
