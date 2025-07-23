-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `stripeCustomerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuyCar` (
    `id` VARCHAR(191) NOT NULL,
    `make` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `trim` VARCHAR(191) NULL,
    `year` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `specifications` JSON NOT NULL,
    `features` JSON NOT NULL,
    `standardEquipment` JSON NULL,
    `addedOptions` JSON NULL,
    `supercarData` JSON NULL,
    `baseMSRP` DOUBLE NULL,
    `performanceData` JSON NULL,
    `pricingData` JSON NULL,
    `description` TEXT NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuyCarImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `carId` VARCHAR(191) NOT NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `imageType` VARCHAR(191) NULL,

    INDEX `BuyCarImage_carId_idx`(`carId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalCar` (
    `id` VARCHAR(191) NOT NULL,
    `make` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `trim` VARCHAR(191) NULL,
    `year` INTEGER NOT NULL,
    `hourlyRate` DOUBLE NOT NULL,
    `dailyRate` DOUBLE NOT NULL,
    `weeklyRate` DOUBLE NOT NULL,
    `specifications` JSON NOT NULL,
    `features` JSON NOT NULL,
    `supercarData` JSON NULL,
    `baseMSRP` DOUBLE NULL,
    `performanceData` JSON NULL,
    `description` TEXT NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `stripeProductId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalCarImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `carId` VARCHAR(191) NOT NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `imageType` VARCHAR(191) NULL,

    INDEX `RentalCarImage_carId_idx`(`carId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `carId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `financingOption` BOOLEAN NOT NULL DEFAULT false,
    `financingTerm` INTEGER NULL,
    `monthlyPayment` DOUBLE NULL,
    `cashDeposit` DOUBLE NULL,
    `tradeInIncluded` BOOLEAN NOT NULL DEFAULT false,
    `quoteStatus` ENUM('PENDING', 'GENERATED', 'RESERVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Quote_carId_idx`(`carId`),
    INDEX `Quote_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rental` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `carId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `rentalDuration` ENUM('HOURLY', 'DAILY', 'WEEKLY') NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `rentalStatus` ENUM('RESERVED', 'PAID', 'PICKED_UP', 'ACTIVE', 'RETURNED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'RESERVED',
    `isSplitPayment` BOOLEAN NOT NULL DEFAULT false,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `stripeSessionId` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `depositAmount` DOUBLE NULL,
    `depositRefunded` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Rental_carId_idx`(`carId`),
    INDEX `Rental_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoRenter` (
    `id` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `paymentAmount` DOUBLE NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `stripeSessionId` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `invitationSent` BOOLEAN NOT NULL DEFAULT false,
    `invitationAccepted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CoRenter_rentalId_idx`(`rentalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeInRequest` (
    `id` VARCHAR(191) NOT NULL,
    `quoteId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `registrationNumber` VARCHAR(191) NOT NULL,
    `make` VARCHAR(191) NULL,
    `model` VARCHAR(191) NOT NULL,
    `colour` VARCHAR(191) NULL,
    `fuelType` VARCHAR(191) NULL,
    `engineCapacity` INTEGER NULL,
    `yearOfManufacture` INTEGER NULL,
    `monthOfFirstRegistration` VARCHAR(191) NULL,
    `motStatus` VARCHAR(191) NULL,
    `taxStatus` VARCHAR(191) NULL,
    `taxDueDate` DATETIME(3) NULL,
    `co2Emissions` INTEGER NULL,
    `euroStatus` VARCHAR(191) NULL,
    `mileage` INTEGER NOT NULL,
    `condition` VARCHAR(191) NOT NULL,
    `conditionDetails` VARCHAR(191) NULL,
    `accidentHistory` BOOLEAN NOT NULL,
    `numberOfAccidents` INTEGER NULL,
    `previousOwners` INTEGER NOT NULL,
    `fullServiceHistory` BOOLEAN NULL,
    `hasModifications` BOOLEAN NULL,
    `interiorCondition` INTEGER NULL,
    `exteriorCondition` INTEGER NULL,
    `images` JSON NULL,
    `estimatedValue` DOUBLE NULL,
    `actualValue` DOUBLE NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `adminNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TradeInRequest_quoteId_key`(`quoteId`),
    INDEX `TradeInRequest_userId_idx`(`userId`),
    INDEX `TradeInRequest_registrationNumber_idx`(`registrationNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StripeProduct` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `type` VARCHAR(191) NOT NULL,
    `defaultAmount` DOUBLE NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'GBP',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuyCarImage` ADD CONSTRAINT `BuyCarImage_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `BuyCar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalCarImage` ADD CONSTRAINT `RentalCarImage_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `RentalCar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `BuyCar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `RentalCar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoRenter` ADD CONSTRAINT `CoRenter_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeInRequest` ADD CONSTRAINT `TradeInRequest_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `Quote`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeInRequest` ADD CONSTRAINT `TradeInRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
