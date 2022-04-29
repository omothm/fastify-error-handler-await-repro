# Reproduction of Fastify error handler await bug

## Description

When I set an error handler on a Fastify instance after registering a plugin within an awaited
statement, the error handler does not work as expected.

An example scenario: Let `f` be a Fastify instance.

- Add a `/` get handler on instance `f` that throws an error.
- Register a plugin on instance `f` with any prefix (e.g., `/bar`) **with an `await` keyword**.
- Set error handler (call it `h`) on instance `f`.

When fetching `/` on this instance, an error is thrown and `h` is expected to run. However, it does
not. The default handler is run instead.

Removing the `await` keyword fixes this issue. But the existence of the `await` keyword or the
nonexistence thereof should not alter any behavior--unless there is an intricacy in this situation
that forces such behavior.

## Running the tests

Running

    $ npm test

will test 3 scenarios:

1. All calls on Fastify instance are **non-awaited**.
1. The `register` call is awaited.
1. The `register` call is awaited _after setting the error handler_.

In the first scenario, the code works as expected.

In the second scenario, the code fails. But it presumably should not. This is the bug targeted by
this reproduction. Why would awaiting alter the behavior?

In the third scenario, an even stranger thing happens. The `register` call is still awaited, but is
now moved _after_ `setErrorHandler`. The code starts working again as expected. I included this
scenario just to highlight the unexpected behavior.
