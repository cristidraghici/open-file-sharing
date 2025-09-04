#!/usr/bin/env php
<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Commands\AddUserCommand;
use Symfony\Component\Console\Application;

$application = new Application('Open File Sharing', '1.0.0');

// Register commands
$application->add(new AddUserCommand());

$application->run();
