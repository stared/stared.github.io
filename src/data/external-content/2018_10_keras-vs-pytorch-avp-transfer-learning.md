---
title: "Keras vs. PyTorch: Alien vs. Predator recognition with transfer learning"
date: 2018-10-03
author: Piotr Migdał
source: https://deepsense.ai/keras-vs-pytorch-avp-transfer-learning/
---

We perform image classification, one of the computer vision tasks deep learning shines at. As training from scratch is unfeasible in most cases (as it is very data hungry), we perform transfer learning using ResNet-50 pre-trained on ImageNet. We get as practical as possible, to show both the conceptual differences and conventions.

At the same time we keep the code fairly minimal, to make it clear and easy to read and reuse.

## Wait, what's transfer learning? And why ResNet-50?

> In practice, very few people train an entire Convolutional Network from scratch (with random initialization), because it is relatively rare to have a dataset of sufficient size. Instead, it is common to pretrain a ConvNet on a very large dataset (e.g. ImageNet, which contains 1.2 million images with 1000 categories), and then use the ConvNet either as an initialization or a fixed feature extractor for the task of interest. – Andrej Karpathy

Transfer learning is a process of making tiny adjustments to a network trained on a given task to perform another, similar task. In our case we work with the ResNet-50 model trained to classify images from the ImageNet dataset. It is enough to learn a lot of textures and patterns that may be useful in other visual tasks, even as alien as this Alien vs. Predator case.

In our case we do it the simplest way:
- keep the pre-trained convolutional layers (so-called feature extractor), with their weights frozen,
- remove the original dense layers, and replace them with brand-new dense layers we will use for training.

ResNet-50 is a popular model for ImageNet image classification (AlexNet, VGG, GoogLeNet, Inception, Xception are other popular models). It is a 50-layer deep neural network architecture based on residual connections, which are connections that add modifications with each layer, rather than completely changing the signal.

ResNet was the state-of-the-art on ImageNet in 2015. Since then, newer architectures with higher scores on ImageNet have been invented. However, they are not necessarily better at generalizing to other datasets.

## Let the match begin!

We do our Alien vs. Predator task in seven steps:
1. Prepare the dataset
2. Import dependencies
3. Create data generators
4. Create the network
5. Train the model
6. Save and load the model
7. Make predictions on sample test images

## Prepare the dataset

We created a dataset by performing a Google Search with the words "alien" and "predator". We saved JPG thumbnails (around 250×250 pixels) and manually filtered the results.

We split our data into two parts:
- Training data (347 samples per class) – used for training the network.
- Validation data (100 samples per class) – not used during the training, but needed in order to check the performance of the model on previously unseen data.

## Create data generators

Normally, the images can't all be loaded at once, as doing so would be too much for the memory to handle. At the same time, we want to benefit from the GPU's performance boost by processing a few images at once. So we load images in batches (e.g. 32 images at once) using data generators. Each pass through the whole dataset is called an epoch.

We also use data generators for preprocessing: we resize and normalize images to make them as ResNet-50 likes them (224 x 224 px, with scaled color channels). And last but not least, we use data generators to randomly perturb images on the fly.

Performing such changes is called data augmentation. We use it to show a neural network which kinds of transformations don't matter. In our case, we randomly shear, zoom and horizontally flip our aliens and predators.

## Create the network

The next step is to import a pre-trained ResNet-50 model. We freeze all the ResNet-50's convolutional layers, and only train the last two fully connected (dense) layers. As our classification task has only 2 classes (compared to 1000 classes of ImageNet), we need to adjust the last layer.

We load the ResNet-50 from both Keras and PyTorch without any effort. They also offer many other well-known pre-trained architectures.

## Train the model

In Keras, the model.fit_generator performs the training… and that's it! Training in Keras is just that convenient. And Keras also gives us a progress bar and a timing function for free. But if you want to do anything nonstandard, then the pain begins…

PyTorch is on the other pole. Everything is explicit here. You need more lines to construct the basic training, but you can freely change and customize all you want.

We have nested loops, iterating over epochs, training and validation phases, and batches.

The magic commands optimizer.zero_grad(), loss.backward() and optimizer.step() (in this order) do the job.

## Save and load the model

Once our network is trained, often with high computational and time costs, it's good to keep it for later. Broadly, there are two types of savings:
- saving the whole model architecture and trained weights (and the optimizer state) to a file,
- saving the trained weights to a file (keeping the model architecture in the code).

One line of code is enough in both frameworks. In Keras you can either save everything to a HDF5 file or save the weights to HDF5 and the architecture to a readable json file. Currently, PyTorch creators recommend saving the weights only. They discourage saving the whole model because the API is still evolving.
